---
layout: post
title: "Source-file-only development in C++"
date: 2021-09-06
categories: programming c++20 modules
---

How do you write and organize your APIs and unit tests in C++?
For me, I usually organize code into groups of three files:
a _header-file_ containing shared definitions,
a _source-file_ containing the production code,
and a _test-file_ containing corresponding unit tests.
This way of dividing code into so many files feels unnecessary and "boilerplaty".
By using C++20 modules and some simple build switches,
it's possible to write code in separate self-contained files
containing all definitions, business logic and unit tests.
That's right! Go away from the need of _three_ files to actually needing to write
just _one_.

## TL;DR

By using a combination of C++20 modules and a simple "unit test on/off"-macro,
it's in theory possible to implement all your C++ code in source files only,
i.e. merging `foo.cpp` `foo.hpp` `foo_test.cpp` into just `foo.cpp`.

If you want to look at the code, and compile it, visit a sample project on my
[GitHub](https://github.com/kjetand/test-in-source/).
The code should compile with CMake and newer MSVC and GCC compilers
(I've tested on MSVC 19.29.30133.0 and GCC 11).

## Motivation

To recap the end-goal of this article:
As a C++ programmer, I want to write my code in the structure illustrated below.

### _app.cpp_ &#128526;

```c++
<Definitions>
<Source code>
<Unit test code>
```

Instead of the usual pattern that may look like this:

### _app.hpp_ &#128528;

```c++
<Definitions>
```

### _app.cpp_ &#128529;

```c++
#include "app.hpp"
<Source code>
```

### _app_test.cpp_ &#128530;

```c++
#include "app.hpp"
#include "test.hpp"
<Unit test code>
```

> **NOTE** in the _Rust_ programming language, it's already common to write
> unit tests in the same file as the corresponding production code.
> One can say that the approach described in this blog post is inspired by this.

In order to illustrate the hopefully motivating end-goal,
we will explore a simple application that calculate some numbers and prints the
result to the user. The example is not very interesting by itself, but the technique
described may be interesting.

## First module: `math`

In the source below we define a math-module for addition and multiplication,
where addition is _public_ and multiplication is _private_.

### _math.cpp_

```c++
export module math;

namespace math {

  export int add(const int a, const int b) {
    return a + b;
  }
  
  int multiply(const int n, const int x) {
    return n * x;
  }

}
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

### _app.cpp_

```c++
module;
#include <fmt/format.h>
export module app;

import math;

namespace app {

  export int main() {
    fmt::print("2 + 3 equals {}", math::add(2, 3));
    return 0;
  }

}
```

There are a few new items to this code we need to understand:

- `module;`: This is called the _global module fragment_ of a module. It simply states to the compiler that we are going
  to define a module, but before we do so, we want to do some "non-modular things", e.g. including non-modular code.
- `import math;`:  Imports a module into the current module. Note that others importing the `app` module will not see what is
  exported by `math`. In order to do this you have to "export the import" like so: `export import math;`.
- `export int main()`: The reason I put the app-main function inside a module is because I like to have _all_ logic in the
  libraries, making it possible to unit test everything.

## Main (first version)

We create the executable with a main function calling the `app::main()` to start the application.

### _main.cpp_

```c++
import app;

int main() {
  return app::main();
}
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

### _test.hpp_

```c++
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

### _app.cpp_

```c++
module;
#include "test.hpp"
export module math;

namespace math {

  export int add(const int a, const int b) {
    return a + b;
  }
  
  int multiply(const int n, const int x) {
    return n * x;
  }

}

UNIT_TESTS(

  TEST_CASE("Two plus three equals five", "[math]") {
    REQUIRE(math::add(2, 3) == 5);
  }
  
  TEST_CASE("Two times three equals five", "[math]") {
    REQUIRE(math::multiply(2, 3) == 5); // This will hopefully fail
  }

)
```

In the above code, if `APP_BUILD_TESTS` is defined the compiler will include all our unit test code together with
the production code in the same binary.

Lets try to compile it.
Without `APP_BUILD_TESTS` defined, compiling the current source code works great. However, in the other case the linker
will scream errors related to `catch2`.
The reason for this is that `catch2` needs to define its own main function, e.g. like this:

```c++
#define CATCH_CONFIG_MAIN
#include <catch2/catch.hpp>
```

## Main (final version)

I earlier made the design choice to compile either as application or test suite, hence I controversially implement our `main.cpp` as follows:

### main.cpp

```c++
import app;

#ifdef APP_BUILD_TESTS

#define CATCH_CONFIG_MAIN
#include <catch2/catch.hpp>

#else

int main() {
  return app::main();
}

#endif
```

Now everything works! If we run the application we'll get `2 + 3 equals 5`,
while running the test suite we get something like this:

```text
-------------------------------------------------------
Two times three equals five
-------------------------------------------------------
C:\test-in\source\src\math.cpp(22)
.......................................................

C:\test-in\source\src\math.cpp(22): FAILED:
  REQUIRE( math::multiply(2, 3) == 5 )
with expansion:
  6 == 5

=======================================================
test cases: 2 | 1 passed | 1 failed
assertions: 2 | 1 passed | 1 failed
```

## Conclusion

With C++20 modules enabled it's possible to encapsulate all production code and tests into your `.cpp` files only. It's
not given that everybody want to develop like this, but in my opinion it removes some of the "annoying" parts of C++
that other languages have solved already.

With these techniques in mind, I can see the following positives:

- The obvious: eliminates lots of boilerplate code.
- Hides implementation details in modules, but still enables us to write unit tests for it. Another way of putting it is
  that we finally can forget the use of `detail`-namespaces to "hide" implementation details.
- All other positives with modules.

> **NOTE** if we keep all the code in our library modules, we probably never need to change `main.cpp` nor `test.hpp` ever again.
> We can focus on writing the actual code rather than finding ways to stitch the code together to make it testable.

But there are for sure some questions to be asked, and possible negatives:

- The code base must be compiled at minimum twice, one for the application and again for the unit test suite. However,
  there may be better ways to do it.
- Does it scale? Build time in large projects may suffer. The technique may be difficult to implement with bigger development teams.
- In general we don't like macros, right? We needed to use two macros that are included everywhere: `APP_BUILD_TESTS` and `UNIT_TESTS`. Please tell me if you find a better way.
- Today we don't have good support for C++20 modules, both in compilers and in build tools like CMake. I got it to work, kinda... using some CMake black magic.

## References

- Complete source code: [github.com/kjetand/test-in-source](https://github.com/kjetand/test-in-source/)
- Great introduction to modules: [vector-of-bool.github.io](https://vector-of-bool.github.io/2019/03/10/modules-1.html)
- `catch2`: [github.com/catchorg/Catch2](https://github.com/catchorg/Catch2)
- `fmt`: [github.com/fmtlib/fmt](https://github.com/fmtlib/fmt)
