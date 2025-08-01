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
    {% include record.html
      title=record.title
      description=record.description
      condition_vinyl=record.condition_vinyl
      condition_cover=record.condition_cover
      price=record.price
      sold=record.sold
      group=group_name
      front_image=record.front_image
      other_images=record.other_images
    %}
  {% endfor %}
</div>

## Grading

Currently I use the _Goldmine Standard_ for grading vinyl
with a slight modification:
added the `EX` (excellent) grade which is a higher-end `VG+` (alternatively lower-end `NM`).
Condition of an item is marked with `[vinyl/cover]`
(e.g. `[NM/VG+]` for Near Mint vinyl and Very Good plus cover).
