---
layout: post
title: "The Good, the Bad and the Ugly"
date: 2021-02-22
categories: programming c++
---

At university we learn to _write_ code, while in industry we learn to _read_ code.
Yes, working as a software engineer is mostly about reading and understanding code that we didn't write our selves.
This includes fixing bugs and extend code with new features that really doesn't fit in. --
_"This code is horrible!"_ --
_"Who wrote this code!?"_ --
Both these thoughts are common when reading others code for the first time.
Actually, when revisiting our own work after a few years, we may even say the same thing about our selves. --
_"What the **** was I thinking?!"_ --
Wouldn't it be nice to write good code?
Code that your co-workers accept.
Code that are maintainable for the years to come.
In order to write good code, we have to know how to separate the _good_ from the _bad_ and the _ugly_.

- `[Good]`: Principles to follow.
- `[Bad]`: Learn to avoid these.
- `[Ugly]`: More a matter of taste?

## Strongly typed interfaces `[Good]`

You've probably experienced an interface that looks like the one below.

```cpp
bool send(unsigned char* data, int size,
          int timeout, int protocol);
```

There are several things wrong here.
First, can size be a negative number?
Second, what is the measure of `timeout`?
Is it minutes, seconds or milliseconds?
And can it be a negative value?
Third, what is the correct number to put in `protocol`?
Probably the user has to look in the documentation and hope that the valid values doesn't change over time.
The compiler will actually not care if the meaning of `protocol` changes.

Of course `size` cannot be negative!
Lets be explicit with signed/unsigned, hence we change the type of `size` to `std::size_t` (or `unsigned int` for that matter).

```cpp
bool send(unsigned char* data, std::size_t size,
          int timeout, int protocol);
```

For `timeout` we mean milliseconds in this case.
To be more explicit and type safe, we use `chrono` library.

```cpp
bool send(unsigned char* data, std::size_t size,
          std::chrono::milliseconds timeout,
          int protocol);
```

Currently, we pretend there are two available protocols.
We use an enum type for this purpose.
Not a regular _C-enum_, but a C++ `enum class` is a much better choice.
An `enum class` is a _strong type_ meaning that it cannot be implicitly converted to e.g. integer types, unlike C-enums.

```cpp
enum class protocols { protocol_1, protocol_2 };

bool send(unsigned char* data, std::size_t size,
          std::chrono::milliseconds timeout,
          protocols protocol);
```

Are we there yet?
Nope.
We should combine the two first parameters into a `std::span` (or `gsl::span` for C++11) to be more clear that the `size` belongs to the `data`.

```cpp
bool send(const std::span<unsigned char>& data,
          std::chrono::milliseconds timeout,
          protocols protocol);
```

Now, this starts to look nice.
I'm pretty happy about the result :)

## High configurability `[Bad]`

A colleague of mine once said _"There are a million ways to configure the system, and one of combinations is the right one"_.
I think this quote illustrates a really important problem in software engineering, i.e. how do we limit configuration options to make the software more maintainable.
Consider the function below that process some letters in a very non-meaningful way...

```cpp
void process_letters(std::span<char>& letters, bool sort,
                     const std::vector<char>& blacklist,
                     bool uppercase);
```

Actually this is not the worst example.
I've experienced programs with hundred or more configuration parameters to even startup.
Good luck of guessing what combination that works!

Back to the code above.
Why should this function do it all?
We can se that it does some _sorting_ of the letters, it has a `blacklist` for removing certain characters from `letters`, and it is able to convert the letters to uppercase.
Think _separation of concerns_.
Split it up into three functions.

```cpp
void sort_letters(std::span<char>& letters);

void filter_letters(std::span<char>& letters,
                    const std::vector<char>& blacklist);

void to_upper(std::span<char>& letters);
```

Removing configurability is a matter of splitting things that does plenty into things that does _one_ thing.
This makes the code more readable, more testable, hence more maintainable.

## Abbreviations `[Ugly]`

Many developers love abbreviations.
They are quick to write.
They look cool.
And we even save disk space!

It's a fact that in the 80s there were compilers that had a max of 8 characters for a symbol name like functions and variables.
It's also a fact that we don't live in the 80s anymore!

> _When Ken Thompson and Dennis Ritchie received the 1983 Turing Award,
  after their respective acceptance speeches, someone in the audience
  asked Ken what he would do differently with Unix if he were to do it
  all over again. He said, "I'd spell 'creat' with an 'e'."_

In fact, in modern times it's recommended to write fully qualified names such that the reader understands what _the thing_ is doing.
It takes a bit of effort to learn _how_ to name things, but after a while you'll get a hang of it.

```cpp
// Validate the spelling of str
if (!vspl(str)) {
    throw std::runtime_error("You messed up the spelling!");
}
```

Familiar code? This we call a _comment smell_.
Why comment on something obvious here.
With a bit of _keyboard effort_ we can improve the code like so:

```cpp
if (not is_valid_spelling(text)) {
    throw std::runtime_error("You messed up the spelling!");
}
```

Much better and clear reading.
And yes I wrote `not`.
Why not!?

As a general rule, if you are working in a small scope you can use abbreviations.
Small scope meaning a scope that fit your screen without need to scroll.
However, strive to write meaningful names on functions, types and variables.
In the end really it doesn't take that much effort to write `create` instead of `creat`.

## Final thoughts

There are hundreds of subjects on good and bad practices in software engineering.
I will leave you with these three _items_ for now, and will come back to the subject.