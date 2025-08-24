---
layout: page
title: Jazz shop
permalink: /shop/
---

From time to time I put out jazz records for sale.
Don't hesitate to contact me through Instagram
[@northernjazzcollector](https://www.instagram.com/northernjazzcollector/)
or [Discogs](https://www.discogs.com/user/kjetand)
if you want to buy records from me or have any questions.

<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<link href="https://cdn.jsdelivr.net/npm/lightbox2@2/dist/css/lightbox.min.css" rel="stylesheet" />
<script src="https://cdn.jsdelivr.net/npm/lightbox2@2/dist/js/lightbox.min.js"></script>

<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px;">
  {% for record in site.data.records %}
    {% assign group_name = "rec" | append: forloop.index0 %}
    {% if record.for_sale %}
    {% include record.html
      title=record.title
      description=record.description
      condition_vinyl=record.condition_vinyl
      condition_cover=record.condition_cover
      price=record.price
      sold=record.sold
      for_sale=record.for_sale
      label=record.label
      catalog=record.catalog
      year=record.year
      discogs_url=record.discogs_url
      group=group_name
      front_image=record.front_image
      other_images=record.other_images
    %}
    {% endif %}
  {% endfor %}
</div>

## Shipping

**Buyer pays shipping.**
Price for international buyers outside Norway may vary from approximately `€20-30`.
I ship records in their inner and outer sleeve.
Record is on the outside of cover to prevent splits.
I use bubble wrap and good outside cardboard material designed for shipping vinyl.
Records are not moving inside my packages!

## Grading

Currently I use the _Goldmine Standard_ for grading vinyl
with a slight modification:
added the `EX` (excellent) grade which is a higher-end `VG+` (alternatively lower-end `NM`).
Condition of an item is marked with `[vinyl/cover]`
(e.g. `[NM/VG+]` for Near Mint vinyl and Very Good plus cover).
