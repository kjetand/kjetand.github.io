---
layout: post
title: "Source-only applications in C++"
date: 2021-10-12
categories: programming c++20 modules
---

How do you write and organize your APIs and unit tests in C++? For me, I usually organize my code in one or several
shared (or static) libraries, exposing public API headers that my main executable and unit test executable includes and
links to. What my projects usually ends up with are lots of header files, source files, test source files, and most
annoyingly:
boilerplate code. - Ok, it's not that bad, but can the experience be better? By using C++20 modules and some simple
build switches (macros), I will show you a technique of writing all your production code in source files only, together
with the corresponding unit tests. That's right! We go from the need of _three_ files to actually needing to write
just _one_.

## Motivation

As a C++ programmer, I want to write my code in the structure illustrated below:

```c++
// app.cpp
<Definitions and source code here>
<unit test code here>
```

instead of the usual pattern that may look like this:

```c++
// app.hpp
<Definitions here>

// app.cpp
#include "app.hpp"
<source code here>

// app_test.cpp
#include "app.hpp"
#include <catch2/catch.hpp>
<unit test code here>
```

> **NOTE** in the _Rust_ programming language, it's already common to write unit tests in the same file as the corresponding production code. One can say that the approach described in this blog post is inspired by this.

## First module: `math`

In the source below we define a math-module for addition and multiplication.

```c++
// math.cpp

export module math;

namespace math {

export int add(const int a, const int b) { return a + b; }

int multiply(const int n, const int x) { return n * x; }

}  // namespace math
```

There are two new keywords that we need to get familiar with:

- `module`: Defines a named module that other source files (translation units) may import. There can only be _one_
  module definition for a single source file.
- `export`: Exports symbols that can be reached outside the translation unit. In the code below, the module itself and
  the function `math::add()` are visible, while the function `math::multiply()` is not visible by others than the module itself.

## Second module: `app`

Our application is defined by the `app` module below, with the main entry point defined. For simplicity, the application
will only print out a simple calculation using the `math` module, and the external `fmt` library for formatting and
printing strings.

```c++
// app.cpp

module;

#include <fmt/format.h>

export module app;

import math;

namespace app {

export int main() {
  fmt::print("2 + 3 equals {}", math::add(2, 3));
  return 0;
}

}  // namespace app
```

There are a few new items to this code we need to understand:

- `module;`: This is called the _global module fragment_ of a module. It simply states to the compiler that we are going
  to define a module, but before we do so, we want to do some "non-modular things", e.g. including non-modular code.
- `import math;`:  Imports a module into the current module. Note that others importing the `app` module will not see what is
  exported by `math`. In order to do this you have to "export the import" like so: `export import math;`.
- `export int main()`: The reason I put a main function inside a module is because I like to have _all_ logic in the
  libraries, making it possible to unit test everything.

> **NOTE** in the future we don't need the global module fragment for including `fmt`.
> Ideally we should write e.g. "`import fmt.format;`" inside the `app` module.

## Main (first version)

We create the executable with a main function calling the `app::main()` to start the application.

```c++
// main.cpp

import app;

int main() { return app::main(); }
```

The output of the program above should be `2 + 3 equals 5`.

Excellent! Now our application is feature complete. The cool thing with this application is that all source code is
written in `.cpp` files only, thanks to C++20 modules.

But hold on... what about the tests?

## Adding unit tests

I have taken a design choice for the code base: the whole code base can either be compiled as the actual application, or
it can be compiled as a test suite. To make this distinction possible we use a compile flag (defined by us)
called `APP_BUILD_TESTS`. When this macro is defined, we compile the code base as the test suite. When the macro is
**not** defined, we compile the application only.

> In _Rust_ you distinguish building the test suite vs. application with "`cargo test`" and "`cargo build`" (at least I think...).

For unit testing we're going to use `catch2`, and we define a test header that we can utilize in the project:

```c++
// test.hpp

#pragma once

#ifdef APP_BUILD_TESTS
#include <catch2/catch.hpp>
#define UNIT_TESTS(code) code
#else
#define UNIT_TESTS(code)
#endif
```

The above header file states that when `APP_BUILD_TESTS` is defined, we include `catch2` and define a macro `UNIT_TESTS`
that takes code as input and outputs the code as-is. Else it defines the macro `UNIT_TESTS` that takes code as input
and outputs nothing.

By using `test.hpp`, we can extend `math.cpp` with some unit tests:

```c++
// math.cpp

module;

#include "test.hpp"

export module math;

namespace math {

export int add(const int a, const int b) { return a + b; }

int multiply(const int n, const int x) { return n * x; }

}  // namespace math

UNIT_TESTS(

TEST_CASE("Two plus three equals five", "[math]") {
  REQUIRE(math::add(2, 3) == 5);
}

TEST_CASE("Two times three equals six", "[math]") {
  REQUIRE(math::multiply(2, 3) == 6);
}

)
```

In the above code, if `APP_BUILD_TESTS` is defined the compiler will include all our unit test code together with
the production code in the same binary.

Lets try to compile it.

## Main (final version)

Without `APP_BUILD_TESTS` defined, compiling the current source code works great. However, in the other case the linker
will scream errors. The reason for this is that `catch2` needs to define its own main function like this:

```c++
#define CATCH_CONFIG_MAIN
#include <catch2/catch.hpp>
```

I earlier made the design choice to compile either as application or test suite, hence I controversially implement our `main.cpp` as follows:

```c++
// main.cpp

import app;

#ifdef APP_BUILD_TESTS
#define CATCH_CONFIG_MAIN
#include <catch2/catch.hpp>
#else
int main() { return app::main(); }
#endif
```

Now everything works! If we run the application we'll get `2 + 3 equals 5`, while running the test suite we get something like this:

```text
===============================================
All tests passed (2 assertions in 2 test cases)
```

## TL;DR

If you just want to look at the code, and compile it, visit a sample project on my
[GitHub](https://github.com/kjetand/test-in-source/). The code should compile with CMake and newer MSVC compilers (I've
tested on MSVC 19.29.30133.0).

## Conclusion

With C++20 modules enabled it's possible to encapsulate all production code and tests into your `.cpp` files only. It's
not given that everybody want to develop like this, but in my opinion it removes some of the "annoying" parts of C++
that other languages have solved already.

With these techniques in mind, I can see the following positives:

- The obvious: eliminates lots of boilerplate code.
- Hides implementation details in modules, but still enables us to write unit tests for it. Another way of putting it is
  that we finally can forget the use of `detail`-namespaces to "hide" implementation details.
- All other positives with modules. 

> **NOTE** we probably never need to change `main.cpp` nor `test.hpp` again, and we can focus on writing the actual code.

But there are for sure some questions to be asked, and possible negatives:

- The code base must be compiled at minimum twice, one for the application and again for the unit test suite. However,
  there may be better ways to do it.
- Does it scale?
  - Build time in large projects may suffer.
  - How will big development teams handle this technique?
  - There is no known _large applications_ implemented proving this pattern.
- We needed to use two macros that are included everywhere: `APP_BUILD_TESTS` and `UNIT_TESTS`. Please tell me if you
  find a better way :)
- Today we don't have good support for C++20 modules, both in compilers and in build tools like CMake. I got it to work
  kinda.

## References

- Complete source code: [github.com/kjetand/test-in-source](https://github.com/kjetand/test-in-source/)
- Great introduction to modules: [vector-of-bool.github.io](https://vector-of-bool.github.io/2019/03/10/modules-1.html)
- `catch2`: [github.com/catchorg/Catch2](https://github.com/catchorg/Catch2)
- `fmt`: [github.com/fmtlib/fmt](https://github.com/fmtlib/fmt)