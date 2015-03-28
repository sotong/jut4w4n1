/*!
 * Tracky for JW Player ~ version 1.0 ~ August 2014, James Herrieven ~ http://powered-by-haiku.co.uk
 * A JW Player plugin providing a basic API for Tracks (chapters/captions/thumbnails)
 */

(function(e){var t=function(e,t,n){function r(t,n,r,i){var s=e.plugins.tracky;var o={};if(s.tracks[t])o=s.tracks[t];o[n]={};o[n][r]=[];var u=i.split("\r\n\r\n");if(u.length==1)u=i.split("\n\n");var a=0;for(var l=0;l<u.length;l++){if(u[l].toLowerCase()!="webvtt"){var c=f(a,u[l]);if(c)o[n][r].push(c);a++}}s.tracks[t]=o}function i(t,n,r,i,s){var o=e.plugins.tracky;var u=o.tracks;n=n||"current";r=r||"captions";i=i||"-";t=t||e.getPlaylistIndex();s=s||e.getPosition();var a=null;var f=null;if(u[t]&&u[t][r]&&u[t][r][i]){var l=u[t][r][i];if(l){if(n=="first"||n=="last"){if(n=="first")a=l[0];if(n=="last")a=l[l.length-1]}else{for(var c=0,h=l.length;c<h;c++){var p=l[c];if(s>=p["beginPosition"]&&s<p["endPosition"])a=p;if(!f){if(s<p["beginPosition"])f=p}if(a||f)c=h}if(a){if(n=="previous"){var d=a["num"];if(d-1>0){a=l[d-1]}else{a=l[0]}}if(n=="next"){var d=a["num"];if(d+1<l.length){a=l[d+1]}else{a=l[l.length-1]}}}else{if(n=="next"){a=f}if(n=="previous"){a=f;var d=a["num"];if(d-1>0){a=l[d-1]}else{a=l[0]}}}}}}return a}function s(t,n,r,i){return e.plugins.tracky.getTrack(t,n,"chapters","-",r,i)}function o(t,n){var r=s(null,t,"beginPosition",n);e.seek(r)}function u(t,n,r,i){return e.plugins.tracky.getTrack(t,n,"thumbnails","-",r,i)}function a(t,n,r,i,s){n=n||e.getCaptionsList()[e.getCurrentCaptions()]["label"];return e.plugins.tracky.getTrack(t,r,"captions",n,i,s)}function f(t,n){var r=0;var i=t;var s=n.split("\r\n");if(s.length==1)s=n.split("\n");if(s[0]!=""){if(s[0].indexOf(" --> ")==-1){i=s[0];r=1}var o=s[r];var u=o.indexOf(" --> ");var a=o.substr(0,u);var f=o.substr(u+5);var l="";for(var c=1,h=s.length;c<h;c++){if(s[c+r])l+=" "+s[c+r]}return{begin:a,end:f,beginPosition:e.plugins.tracky.timeToSeconds(a),endPosition:e.plugins.tracky.timeToSeconds(f),num:t,chapter:i,info:l!=""?l.substring(1):l}}else{return null}}function l(e,t,n,r,i){var s;if(c(e)&&window.XDomainRequest){s=new window.XDomainRequest;s.ontimeout=s.onprogress=function(){};s.timeout=5e3;try{s.open("GET",e,true);s.onload=function(){t(n,r,i,s.responseText)};s.send(null)}catch(o){if(top.console)console.info("Oops! XDomainRequest: "+o+": "+e)}}else{if(window.XMLHttpRequest){s=new XMLHttpRequest}else{s=new ActiveXObject("Microsoft.XMLHTTP")}try{if(s.overrideMimeType)s.overrideMimeType("text/plain");s.open("GET",e,true);s.onreadystatechange=function(){if(s.readyState===4){if(s.status==200){t(n,r,i,s.responseText)}else{if(top.console)console.info("Oops! XMLHttpRequest: "+s.status)}}};s.send(null)}catch(o){if(top.console)console.info("Oops! XMLHttpRequest: "+o+": "+e)}}}function c(e){return e&&e.indexOf("://")>=0&&e.split("/")[2]!=window.location.href.split("/")[2]}e.onReady(function(){var t=e.plugins.tracky;var n=e.getPlaylist();if(n){for(var i=0,s=n.length;i<s;i++){var o=n[i];var u=o["tracks"];if(u){for(var a=0,f=u.length;a<f;a++){var c=u[a]["file"];var h=u[a]["kind"]?u[a]["kind"]:"captions";var p=u[a]["label"]?u[a]["label"]:"-";l(c,function(e,t,n,i){r(e,t,n,i)},i,h,p)}}}}});this.about={label:"Tracky for JW Player",version:"v1.0",author:"James Herrieven ~ http://powered-by-haiku.co.uk"};this.tracks={};this.getTracks=function(t,n,r){var i=e.plugins.tracky;var s=i.tracks;n=n||"captions";r=r||"-";t=t||e.getPlaylistIndex();if(s[t]&&s[t][n]&&s[t][n][r]){return s[t][n][r]}else{return null}};this.getTrack=function(e,t,n,r,s,o){var u=i(e,t,n,r,o);if(u){if(s&&u[s]!=null){return u[s]}else{return u}}else{return null}};this.getCurrentChapter=function(e,t){return s(t,"current",e)};this.getFirstChapter=function(e,t){return s(t,"first",e)};this.getLastChapter=function(e,t){return s(t,"last",e)};this.getNextChapter=function(e,t){return s(t,"next",e)};this.getPreviousChapter=function(e,t){return s(t,"previous",e)};this.getChapterAt=function(e,t,n){return s(n,"position",t,e)};this.getChapters=function(t){return e.plugins.tracky.getTracks(t,"chapters","-")};this.seekToFirstChapter=function(){o("first")};this.seekToLastChapter=function(){o("last")};this.seekToNextChapter=function(){o("next")};this.seekToPreviousChapter=function(){o("previous")};this.seekToChapterAt=function(e){o("position",e)};this.getCurrentThumbnail=function(e,t){return u(t,"current",e)};this.getFirstThumbnail=function(e,t){return u(t,"first",e)};this.getLastThumbnail=function(e,t){return u(t,"last",e)};this.getNextThumbnail=function(e,t){return u(t,"next",e)};this.getPreviousThumbnail=function(e,t){return u(t,"previous",e)};this.getThumbnailAt=function(e,t,n){return u(n,"position",t,e)};this.getThumbnails=function(t){return e.plugins.tracky.getTracks(t,"thumbnails","-")};this.getCurrentCaption=function(e,t,n){return a(n,t,"current",e)};this.getFirstCaption=function(e,t,n){return a(n,t,"first",e)};this.getLastCaption=function(e,t,n){return a(n,t,"last",e)};this.getNextCaption=function(e,t,n){return a(n,t,"next",e)};this.getPreviousCaption=function(e,t,n){return a(n,t,"previous",e)};this.getCaptionAt=function(e,t,n,r){return a(r,n,"position",t,e)};this.getCaptions=function(t,n){n=n||e.getCaptionsList()[e.getCurrentCaptions()]["label"];return e.plugins.tracky.getTracks(t,"captions",n)};this.timeToSeconds=function(e){e=e.replace(/,/g,".");var t=e.split(":");var n=Number(t[t.length-1])+Number(t[t.length-2])*60;if(t.length>2){n+=Number(t[t.length-3])*3600}return n};};e().registerPlugin("tracky","6.0",t)})(jwplayer)