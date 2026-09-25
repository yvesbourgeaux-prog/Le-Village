(function(){const root=window.document.getElementById("lv-26baac5e7dfc");if(!root)return;const document=window.lvScopedDocument(root);

    function getShareUrl() {
        try { return encodeURIComponent((window.top && window.top.location.href) ? window.top.location.href : window.location.href); } 
        catch (e) { return encodeURIComponent(window.location.href); }
    }
    function getShareText() {
        try { return encodeURIComponent(document.title + ' - ' + ((window.top && window.top.location.href) ? window.top.location.href : window.location.href)); } 
        catch (e) { return encodeURIComponent(document.title + ' - ' + window.location.href); }
    }
    function shareOnFacebook() { window.open('https://www.facebook.com/sharer/sharer.php?u=' + getShareUrl(), '_blank', 'width=640,height=580'); }
    function shareOnWhatsApp() { window.open('https://wa.me/?text=' + getShareText(), '_blank'); }

document.querySelector('[data-lv-event="h0"]')?.addEventListener("click",function(event){const result=(function(event){shareOnFacebook()}).call(this,event);if(result===false)event.preventDefault();});
document.querySelector('[data-lv-event="h1"]')?.addEventListener("click",function(event){const result=(function(event){shareOnWhatsApp()}).call(this,event);if(result===false)event.preventDefault();});
})();