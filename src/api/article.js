import request from '@/utils/request'

export function fetchList(query) {
    return request({
        url: '/article/list',
        method: 'get',
        params: query
    })
}
export function queryArticle(keyword, index, max) {
    return request({
        url: '/article/search',
        method: 'get',
        params: {
            keyword,
            index,
            max

        }
    })
}

export function fetchArticle(id) {
    return request({
        url: '/article/query',
        method: 'get',
        params: { id }
    })
}

export function fetchPv(pv) {
    return request({
        url: '/vue-element-admin/article/pv',
        method: 'get',
        params: { pv }
    })
}

export function createArticle(data) {
    return request({
        url: '/article/insert',
        method: 'post',
        data
    })
}

export function updateArticle(data) {
    return request({
        url: 'http://47.106.127.17:31090/update',
        method: 'post',
        data
    })
}
export function deleteArticle(id) {
    return request({
        url: '/article/delete',
        method: 'post',
        params: { id }
    })

}