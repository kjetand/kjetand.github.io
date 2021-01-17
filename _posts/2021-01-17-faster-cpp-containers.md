---
layout: post
title: "Faster C++ containers?"
date: 2021-01-24
categories: programming c++
---

How do we use _mutating C++ STL algorithms_ on containers without making unnecessary copies and moves?
For the lucky ones working with C++20, we have the _ranges library_ which solves this problem with the notion of
_range views_.
In this post we will explore how we can utilize STL algorithms and implement _container views_ in C++17.

To illustrate the problem, assume we have a large data structure called `priority_packet` that will be part of a `std::vector<priority_packet>` of packets.

```cpp
#include <array>
#include <vector>

struct priority_packet {
    unsigned priority;
    std::array<unsigned char, 1024> data;
};
```

Our goal is to improve the performance of mutating STL algorithms like `std::partition`, `std::sort`, and other algorithms that "shuffle" objects around.

## Container views

The idea behind a _container view_ is to make a separate container referencing the origin container, i.e. a container of references to the origin data.
For our purposes we define `packet_ref` as a reference to a `priority_packet`, and `packets_view` as a vector of references to `priority_packet`.

```cpp
using packet_ref = std::reference_wrapper<priority_packet>;
using packets_view = std::vector<packet_ref>;
```

To make a view of packets we use the _iterator constructor_ supported by `std::vector`.

```cpp
packets_view packets(random_packets.begin(),
                     random_packets.end());
```

Thats it! Now we have a view of packets to work with.

The technical advantage of working with container views is that references are small (i.e. size of a pointer), and shuffling references inside a container is potentially much cheaper than shuffling big data types like `priority_packet`.
However, _cache locality_ may become an issue because adjacent references may point in totally different directions into the origin container.
The rule of thumb here is "always measure" if performance gain is important for you.

## Benchmarks

For test purposes, we generate a randomized vector of packets with _priorities_ ranging from 0 to 9.

```cpp
#include <random>

constexpr auto COUNT = /* An integer */;

const auto random_packets = []() {
    packets_type random_packets;
    random_packets.reserve(COUNT);

    for (unsigned p = 0; p < COUNT; p++) {
        random_packets.push_back({p % 10, {}});
    }
    std::random_device rd;
    std::mt19937 random_generator(rd());
    std::shuffle(random_packets.begin(),
                 random_packets.end(),
                 random_generator);

    return random_packets;
}();
```

We will use [_quick bench_](https://quick-bench.com/) to measure and compare performance between "regular containers" and "container views".

For our first benchmark, we will apply `std::partition` on our packets, sorting the packets with _priority_ less than 5 to the left, and the others to the right.
We use `GCC 9.3` with `O3` and `libstdc++`.

```cpp
// Regular container benchmark
std::partition(packets.begin(), packets.end(),
    [](const priority_packet& packet) {
        return packet.priority < 5;
    });

// Container view benchmark
packets_view packets_view(packets.begin(), packets.end());
std::partition(packets_view.begin(), packets_view.end(),
    [](const auto& packet) {
        return packet.get().priority < 5;
    });
```

The table below lists how much faster the container view benchmark is.
Note that we include the initialization of the `packets_view` into the benchmark.

| `COUNT`    | Result       |
|:----------:|:------------:|
| 10         | 1.4 x faster |
| 100        | 2.2 x faster |
| 1000       | 2.4 x faster |
| 10000      | 2.3 x faster |

In the next benchmark, we will apply `std::partition` on the whole container, then we will do the same for the left and right side.
The purpose of this benchmark is to apply multiple algorithms in sequence and see if there is a difference.

```cpp
// Regular container benchmark
auto pivot = std::partition(
    packets.begin(), packets.end(),
    [](const priority_packet& packet) {
        return packet.priority < 5;
    });
std::partition(packets.begin(), pivot,
    [](const auto& packet) {
        return packet.priority < 2;
    });
std::partition(pivot, packets.end(),
    [](const auto& packet) {
        return packet.priority < 7;
    });

// Container view benchmark
packets_view packets_view(packets.begin(), packets.end());
auto pivot = std::partition(
    packets_view.begin(), packets_view.end(),
    [](const auto& packet) {
        return packet.get().priority < 5;
    });
std::partition(packets_view.begin(), pivot,
    [](const auto& packet) {
        return packet.get().priority < 2;
    });
std::partition(pivot, packets_view.end(),
    [](const auto& packet) {
        return packet.get().priority < 7;
    });
```

And indeed things speed up significantly.

| `COUNT`    | Result       |
|:----------:|:------------:|
| 10         | 1.7 x faster |
| 100        | 2.8 x faster |
| 1000       | 3.0 x faster |
| 10000      | 2.8 x faster |

## Final thoughts

We saw that _container views_ are faster on big objects in the use cases illustrated above.
My hunch is that container views are really useful when applying multiple algorithms on a container in sequence, but more investigation is needed.

Another use case is working with `const` containers.
You could imagine a function like the one below, where we want to transform `ts` and return a new vector with the result (without mutating `ts`).


```cpp
std::vector<T> transform(const std::vector<T>& ts) {
    std::vector<std::reference_wrapper<T>> ts_view(
        ts.begin(), ts.end()
    );
    // Fancy algorithms on ts_view here...

    // ...then make copies of ts_view into results
    std::vector<T> results;
    result.reserve(ts_view.size());
    std::transform(
        ts_view.begin(). ts_view.end(),
        std::back_inserter(results),
        [](auto& t) { return t.get(); });

    return results;
}
```

Well, there are a lot to discuss around the subject "performance" and "benchmarks", but lets leave it there.
Remember, the key take-away from this post is "always measure" if you want better performance in your application.
