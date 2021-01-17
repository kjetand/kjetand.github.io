cmake_minimum_required(VERSION 3.15)
project(kjetand.github.io)

find_program(BUNDLER bundler)
message(STATUS ${BUNDLER})

if (BUNDLER)
    add_custom_target(${PROJECT_NAME} COMMAND ${BUNDLER} exec jekyll build WORKING_DIRECTORY ${PROJECT_SOURCE_DIR})
    add_custom_target(serve COMMAND ${BUNDLER} exec jekyll serve  --force_polling WORKING_DIRECTORY ${PROJECT_SOURCE_DIR})
    add_dependencies(serve ${PROJECT_NAME})
endif ()