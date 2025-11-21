#!/bin/env bash

yq '.[] | (.for_sale | tostring) +" "+ (.sold | tostring) +" "+ (.price | tostring) +" "+ (.condition_vinyl | tostring) +"/"+ (.condition_cover | tostring) +" "+ (.title | tostring) +" (Jazz, "+ .label +", "+ (.catalog | tostring) +") "+ .description'  _data/records.yml \
  | grep "true false" \
  | sed 's/"//g; s/false //g; s/true //g' \
  | awk '{print; print ""}'
