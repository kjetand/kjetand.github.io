#!/bin/env bash

yq '.[] | (.for_sale | tostring) +" "+ (.sold | tostring) + " "+ (.price | tostring)'  _data/records.yml \
  | grep "true false" \
  | awk '{sum += $3} END {print sum}'
