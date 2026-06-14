# amitmund_ad_widget
To manage ad and to make people aware.


# Purge:
https://www.jsdelivr.com/tools/purge

# To generate CDN from github

https://www.jsdelivr.com/github

---

13th/june/2026:

I am also planing if we can add a version on the widget.js


---

## Final:

Just use

```
<script defer src="https://cdn.jsdelivr.net/gh/Amitmund/amitmund_ad_widget/widget.js"></script>
```

On all the website.

Only on the testing site, do cache-burst.
```
<script defer src="https://cdn.jsdelivr.net/gh/Amitmund/amitmund_ad_widget/widget.js?v=1.0.0"></script>
```



---

# To be able to run the add

### Just add the following 1 line at your website.

```
<script defer src="https://cdn.jsdelivr.net/gh/Amitmund/amitmund_ad_widget/widget.js?ts=20260607002"></script>
```

```
    <!-- ================= AD RAIL WIDGET ================= -->
    <script defer data-cfasync="false" src="https://cdn.jsdelivr.net/gh/Amitmund/amitmund_ad_widget/widget.js?ts=20260607002"></script>

```

### OR

in place of hardcording:

```
    <script>
    (function() {
        const ts = Math.floor(Date.now() / (15 * 60 * 1000));
        const script = document.createElement('script');
        script.src = `https://cdn.jsdelivr.net/gh/Amitmund/amitmund_ad_widget/widget.js?v=${ts}`;
        script.defer = true;
        document.head.appendChild(script);
    })();
    </script>
```
    

## Another approach

```
<script defer src="https://cdn.jsdelivr.net/gh/Amitmund/amitmund_ad_widget/widget.js?v=1.0.0"></script>
```


### Or another options

```
<script>
function loadWidget() {
    const old = document.getElementById('ad-widget');

    if (old) old.remove();

    const s = document.createElement('script');
    s.id = 'ad-widget';
    s.src = `https://cdn.jsdelivr.net/gh/Amitmund/amitmund_ad_widget/widget.js?t=${Date.now()}`;
    document.body.appendChild(s);
}

loadWidget();
setInterval(loadWidget, 15 * 60 * 1000);
</script>
```



### another one:

```
// widget-loader.js

const ts = Math.floor(Date.now() / (15 * 60 * 1000));

const s = document.createElement('script');
s.src = `https://cdn.jsdelivr.net/gh/Amitmund/amitmund_ad_widget/widget.js?t=${ts}`;
document.head.appendChild(s);

```



### Or not using jsDeliver and insted, consider service from your own domain, where you can set:

```
Cache-Control: max-age=900


---


# To purge:

```
https://purge.jsdelivr.net/gh/Amitmund/amitmund_ad_widget/widget.js

https://purge.jsdelivr.net/gh/Amitmund/amitmund_ad_widget/config.json


```

## Current cached value

```
https://cdn.jsdelivr.net/gh/Amitmund/amitmund_ad_widget/widget.js

https://cdn.jsdelivr.net/gh/Amitmund/amitmund_ad_widget/config.json

```


# Note

Just need to add the following code just before of the </body> on the base.html within the template. 

The system look for the viewport and play the ads automatically.


# Few tech:
```
🧠 Key clarification

You likely saw:

<script src="widget.js"></script>

and later:

<script src="beacon.min.js"></script>

👉 That second one is NOT replacing yours
👉 It is being injected by Cloudflare at edge/CDN level

🚨 Why this matters

It usually happens when you enable:

Cloudflare features like:
Web Analytics
Zaraz
Rocket Loader (sometimes)
Auto-injected scripts
```


## Troubleshooting approach using:

```
{
  "version": "1.0.1", <-- Added this one, so that we can use on `console.log` with config.version to match.
  "scrollSpeed": 1,

  "ads": [
    {
      "template": "https://cdn.jsdelivr.net/gh/Amitmund/amitmund_ad_widget/templates/positive.html",
      "image": "https://cdn.jsdelivr.net/gh/Amitmund/amitmund_ad_widget@main/assets/images/subod-behera-car-sell.png",
      "title": "",
      "message": "Trusted by thousands",
      "url": "https://sretoolkit.com/blog/post/widgetjs/"
    },
    {
      "template": "https://cdn.jsdelivr.net/gh/Amitmund/amitmund_ad_widget/templates/negative.html",
      "image": "https://cdn.jsdelivr.net/gh/Amitmund/amitmund_ad_widget@main/assets/images/pradeep-painter.jpeg",
      "title": "On Public Interest",
      "message": "DO NOT TRUST - Pradeep From Raipur, House Color Contractor - 6393260901",
      "url": "https://SREToolkit.com"
    },
    {
      "template": "https://cdn.jsdelivr.net/gh/Amitmund/amitmund_ad_widget/templates/promo.html",
      "image": "https://cdn.jsdelivr.net/gh/Amitmund/amitmund_ad_widget@main/assets/images/subod-behera-car-sell.png",
      "title": "Car Sell on Bhawanipatna",
      "message": "Car Sell on Bhawanipatna contact me.",
      "url": "https://sretoolkit.com/blog/post/widgetjs/"
    }
  ]
}

```

#### Troubleshooting using the `console.log`

```
console.log("Ad Config Version:", config.version);
```
