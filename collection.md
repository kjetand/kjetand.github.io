---
layout: page
title: Collection
permalink: /collection/
---

<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<link href="https://cdn.jsdelivr.net/npm/lightbox2@2/dist/css/lightbox.min.css" rel="stylesheet" />
<script src="https://cdn.jsdelivr.net/npm/lightbox2@2/dist/js/lightbox.min.js"></script>

<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px;">
  {% for record in site.data.records %}
    {% assign group_name = "rec" | append: forloop.index0 %}
    {% unless record.for_sale %}
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
    {% endunless %}
  {% endfor %}
</div>
