/*
* @File     : kunyu77_open.js.js
* @Author   : jade
* @Date     : 2023/12/22 16:09
* @Email    : jadehh@1ive.com
* @Software : Samples
* @Desc     :
*/
import {Crypto, dayjs, jinja2, Uri, _} from "../lib/cat.js";

let key = "kunyu77", url = "http://api.tyun77.cn", device = {}, timeOffset = 0, siteKey = "", siteType = 0;


function getName() {
    return "👒‍┃酷云┃👒"
}

function getAppName() {
    return "酷云"
}

async function request(reqUrl, agentSp) {
    var sj = dayjs().unix() - timeOffset, uri = new Uri(reqUrl);
    uri.addQueryParam("pcode", "010110005"), uri.addQueryParam("version", "2.1.6"), uri.addQueryParam("devid", device.id), uri.addQueryParam("package", "com.sevenVideo.app.android"), uri.addQueryParam("sys", "android"), uri.addQueryParam("sysver", device.release), uri.addQueryParam("brand", device.brand), uri.addQueryParam("model", device.model.replaceAll(" ", "_")), uri.addQueryParam("sj", sj);
    let keys = [];
    for (var k, i = 0; i < uri.queryPairs.length; i++) keys.push(uri.queryPairs[i][0]);
    keys = _.sortBy(keys, function (name) {
        return name
    });
    let tkSrc = uri.path();
    for (k of keys) {
        var v = uri.getQueryParamValue(k), v = encodeURIComponent(v);
        tkSrc += v
    }
    tkSrc = tkSrc + sj + "XSpeUFjJ", console.log(tkSrc);
    reqUrl = Crypto.MD5(tkSrc).toString().toLowerCase(), console.log(reqUrl), agentSp = {
        "user-agent": agentSp || "okhttp/3.12.0",
        t: sj,
        TK: reqUrl
    }, sj = await req(uri.toString(), {headers: agentSp}), reqUrl = sj.headers.date, agentSp = sj.content, sj = dayjs(reqUrl).unix();
    return timeOffset = dayjs().unix() - sj, agentSp
}

async function init(cfg) {
    siteKey = cfg.skey, siteType = cfg.stype;
    cfg = await local.get(key, "device");
    if (0 < cfg.length) try {
        device = JSON.parse(cfg)
    } catch (error) {
    }
    _.isEmpty(device) && ((device = randDevice()).id = randStr(32).toLowerCase(), device.ua = "Dalvik/2.1.0 (Linux; U; Android " + device.release + "; " + device.model + " Build/" + device.buildId + ")", await local.set(key, "device", JSON.stringify(device))), await request(url + "/api.php/provide/getDomain"), await request(url + "/api.php/provide/config"), await request(url + "/api.php/provide/checkUpgrade"), await request(url + "/api.php/provide/channel")
}

async function home(filter) {
    var data = JSON.parse(await request(url + "/api.php/provide/filter")).data, classes = [], filterObj = {},
        filterAll = [];
    for (const key in data) if (classes.push({type_id: key, type_name: data[key][0].cat}), filter) try {
        var typeId = key.toString();
        if (_.isEmpty(filterAll)) {
            var filterData = JSON.parse(await request(url + "/api.php/provide/searchFilter?type_id=0&pagenum=1&pagesize=1")).data.conditions,
                year = {key: "year", name: "年份", init: ""};
            let yearValues = [];
            yearValues.push({n: "全部", v: ""}), filterData.y.forEach(e => {
                yearValues.push({n: e.name, v: e.value})
            }), year.value = yearValues;
            var area = {key: "area", name: "地区", init: ""};
            let areaValues = [];
            areaValues.push({n: "全部", v: ""}), filterData.a.forEach(e => {
                areaValues.push({n: e.name, v: e.value})
            }), area.value = areaValues;
            var type = {key: "category", name: "类型", init: ""};
            let typeValues = [];
            typeValues.push({n: "全部", v: ""}), filterData.scat.forEach(e => {
                typeValues.push({n: e.name, v: e.value})
            }), type.value = typeValues, filterAll.push(year, area, type)
        }
        _.isEmpty(filterAll) || (filterObj[typeId] = filterAll)
    } catch (e) {
        console.log(e)
    }
    return JSON.stringify({class: classes, filters: filterObj})
}

async function homeVod() {
    var videos = [];
    for (const block of JSON.parse(await request(url + "/api.php/provide/homeBlock?type_id=0")).data.blocks) {
        var name = block.block_name;
        if (!(0 <= name.indexOf("热播"))) for (const content of block.contents) videos.push({
            vod_id: content.id,
            vod_name: content.title,
            vod_pic: content.videoCover,
            vod_remarks: content.msg
        })
    }
    return JSON.stringify({list: videos})
}

async function category(tid, pg, filter, extend) {
    var tid = url + "/api.php/provide/searchFilter?type_id=" + tid + "&pagenum=" + pg + "&pagesize=24&",
        pg = (tid += jinja2("year={{ext.year}}&category={{ext.category}}&area={{ext.area}}", {ext: extend}), JSON.parse(await request(tid)).data),
        videos = [];
    for (const vod of pg.result) videos.push({
        vod_id: vod.id,
        vod_name: vod.title,
        vod_pic: vod.videoCover,
        vod_remarks: vod.msg
    });
    return JSON.stringify({page: parseInt(pg.page), pagecount: pg.pagesize, limit: 24, total: pg.total, list: videos})
}

async function detail(id) {
    var data = JSON.parse(await request(url + "/api.php/provide/videoDetail?ids=" + id)).data,
        vod = (console.log(data), {
            vod_id: data.id,
            vod_name: data.videoName,
            vod_pic: data.videoCover,
            type_name: data.subCategory,
            vod_year: data.year,
            vod_area: data.area,
            vod_remarks: data.msg,
            vod_actor: data.actor,
            vod_director: data.director,
            vod_content: data.brief.trim()
        }), playlist = {};
    for (const episode of JSON.parse(await request(url + "/api.php/provide/videoPlaylist?ids=" + id)).data.episodes) for (const playurl of episode.playurls) {
        var from = playurl.playfrom;
        let t = formatPlayUrl(vod.vod_name, playurl.title);
        0 == t.length && (t = playurl.title.trim()), playlist.hasOwnProperty(from) || (playlist[from] = []), playlist[from].push(t + "$" + playurl.playurl)
    }
    vod.vod_play_from = _.keys(playlist).join("$$$");
    var vod_play_url = [];
    for (const urlist of _.values(playlist)) vod_play_url.push(urlist.join("#"));
    return vod.vod_play_url = vod_play_url.join("$$$"), JSON.stringify({list: [vod]})
}

async function play(flag, id, flags) {
    try {
        let jx_content = await request(url + "/api.php/provide/parserUrl?url=" + id + "&retryNum=0")
        let jx_json = JSON.parse(jx_content)
        let playHeader = jx_json.playHeader
        let jx_url = jx_json.data.url
        let content = await request(jx_url, {"user-agent": "okhttp/3.12.0"})
        let content_json = JSON.parse(content)
        return JSON.stringify({
            parse: 0,
            url: content_json.url,
            header: playHeader,
            format: "application/octet-stream",
        });
    } catch (e) {
        return JSON.stringify({parse: 0, url: id})
    }
}

async function search(wd, quick) {
    var videos = [];
    for (const vod of JSON.parse(await request(url + "/api.php/provide/searchVideo?searchName=" + wd + "&pg=1", "okhttp/3.12.0")).data) videos.push({
        vod_id: vod.id,
        vod_name: vod.videoName,
        vod_pic: vod.videoCover,
        vod_remarks: vod.msg
    });
    return JSON.stringify({list: videos})
}

const charStr = "abacdefghjklmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ0123456789";

function randStr(len, withNum) {
    for (var _str = "", containsNum = void 0 === withNum || withNum, i = 0; i < len; i++) {
        var idx = _.random(0, containsNum ? charStr.length - 1 : charStr.length - 11);
        _str += charStr[idx]
    }
    return _str
}

function randDevice() {
    return {
        brand: "Huawei",
        model: "HUAWEI Mate 20",
        release: "10",
        buildId: randStr(3, !1).toUpperCase() + _.random(11, 99) + randStr(1, !1).toUpperCase()
    }
}

function formatPlayUrl(src, name) {
    return name.trim().replaceAll(src, "").replace(/<|>|《|》/g, "").replace(/\$|#/g, " ").trim()
}

function jsonParse(input, json) {
    try {
        let url = json.url ?? "";
        var headers, ua, referer;
        return (url = url.startsWith("//") ? "https:" + url : url).startsWith("http") ? (headers = json.headers || {}, 0 < (ua = (json["user-agent"] || "").trim()).length && (headers["User-Agent"] = ua), 0 < (referer = (json.referer || "").trim()).length && (headers.Referer = referer), {
            header: headers,
            url: url
        }) : {}
    } catch (error) {
        console.log(error)
    }
    return {}
}

function __jsEvalReturn() {
    return {init: init, home: home, homeVod: homeVod, category: category, detail: detail, play: play, search: search}
}

export {__jsEvalReturn};