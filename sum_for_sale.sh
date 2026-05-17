#!/bin/env bash

sum=$(yq '.[] | (.for_sale | tostring) +" "+ (.sold | tostring) + " "+ (.price | tostring)'  _data/records.yml \
  | grep "true false" \
  | awk '{sum += $3} END {print sum * 10.82}')

echo "FOR SALE VALUE: $sum kr"

sum=$(yq '.[] | (.for_sale | tostring) +" "+ (.sold | tostring) + " "+ (.price | tostring)'  _data/records.yml \
  | grep "false false" \
  | awk '{sum += $3} END {print sum * 10.82}')

echo "COLLECTION VALUE: $sum kr"
