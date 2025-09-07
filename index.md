---
layout: page
---

♫ <a href="shop">Shop</a>&nbsp;&nbsp;
𐄎 <a href="collection">Collection</a>&nbsp;&nbsp;
☛ <a href="about">About</a>
<br/><br/>

{% for post in site.posts %}
  <h2><a href="{{ post.url }}">{{ post.title }}</a></h2>
  <p>{{ post.excerpt }}</p>

  <p style="text-align: right">
    {% for category in post.categories %}
      <code class="language-plaintext highlighter-rouge">{{ category }}</code>&nbsp;
    {% endfor %}
  </p>
{% endfor %}
