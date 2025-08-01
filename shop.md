---

layout: page
title: Jazz shop
permalink: /shop/
---

From time to time I put out jazz records for sale.
Don't hesitate to contact me through Instagram
[@northernjazzcollector](https://www.instagram.com/northernjazzcollector/)
if you want to buy or have any questions.

<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<link href="https://cdn.jsdelivr.net/npm/lightbox2@2/dist/css/lightbox.min.css" rel="stylesheet" />
<script src="https://cdn.jsdelivr.net/npm/lightbox2@2/dist/js/lightbox.min.js"></script>

<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px;">
  {% for record in site.data.records %}
    {% include record.html
      title=record.title
      description=record.description
      condition_vinyl=record.condition_vinyl
      condition_cover=record.condition_cover
      price=record.price
      sold=record.sold
      group=record.group
      front_image=record.front_image
      other_images=record.other_images
    %}
  {% endfor %}
</div>
