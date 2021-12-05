import request from '@/utils/request'
export function queryById(id) {
    return request({
        url: '/balance/query',
        method: 'get',
        params: { id }
    })
}
export function queryByDate(index, max, date) {
    return request({
        url: '/balance/sum/list',
        method: 'get',
        params: { index, max, date }
    })
}
export function queryInList(index, max, date) {
    return request({
        url: '/balance/in/list',
        method: 'get',
        params: { index, max, date }
    })
}
export function queryOutList(index, max, date) {
    return request({
        url: '/balance/out/list',
        method: 'get',
        params: { index, max, date }
    })
}
export function createBalance(data) {
    return request({
        url: '/balance/add',
        method: 'post',
        data
    })
}
export function updateBalance(data) {
    return request({
        url: '/balance/update',
        method: 'post',
        data
    })
}
export function fetchBalance(id) {
    return request({
        url: '/balance/query',
        method: 'get',
        params: { id }
    })
}
export function deleteBalance(id) {
    return request({
        url: '/balance/delete',
        method: 'post',
        params: { id },
        transformRequest: [function(data) {
            let ret = ''
            for (let it in data) {
                ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
            }
            return ret
        }],
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }

    })

}
export function getSum(date) {
    return request({
        url: '/balance/in',
        method: 'get',
        params: { date }
    })
}
export function getOut(date) {
    return request({
        url: '/balance/out',
        method: 'get',
        params: { date }
    })
}