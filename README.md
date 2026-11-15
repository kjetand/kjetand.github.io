# Midnight Sun Records

A vintage jazz record shop, built with Jekyll and hosted on GitHub Pages.

## Updating the shop
- **Records:** edit `_data/records.yml`. Every entry becomes a sleeve in the grid and gets its own detail view at `/#<title>-<catalog>`.
- **Photos:** put each record's photos in a folder named after its Discogs release ID, e.g. `assets/img/16974390/` for `https://www.discogs.com/release/16974390` (a second copy of the same release gets `16974390_2`). Number the files `1.jpg`, `2.jpg`, … and set `front_image` to the cover. The gallery automatically shows every photo in that folder in numeric order, so `other_images` is ignored and records can have any number of photos.
- **Shop name and contact info:** edit `_config.yml`.
- **Look:** `assets/css/style.css`. The colours and fonts are set at the top, in `:root`.

## Preview locally

    jekyll serve      # then open http://localhost:4000
