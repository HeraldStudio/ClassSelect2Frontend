const axios = require('axios')

const api = axios.create({
  baseURL: 'http://myseu.cn:8087',
  timeout: 20000,
  transformResponse (data) {
    return JSON.parse(data).content
  }
});

async function testUser(id) {
  let name = 'test' + id
  let res = (await api.put('login', `cardnum=${name}&schoolnum=${name}&name=${name}`)).data
  if (res !== 'OK') {
    console.log('创建用户失败')
  }

  let token = (await api.post('login', `cardnum=${name}&schoolnum=${name}&phone=10000000000`)).data.token
  if (!/^[0-9a-fA-F]{32}$/.test(token)) {
    console.log('Token错误', token)
  }

  let classes = (await api.get(`class?token=${token}`)).data
  for (let ggroup of classes) {
    for (let group of ggroup.groups) {
      for (let clazz of group.classes) {
        if (!clazz.selected && clazz.count < clazz.capacity) {
          let cid = clazz.cid
          let res = (await api.post('class', `token=${token}&cid=${cid}`)).data
          console.log(res)
        }
      }
    }
  }

  console.log('Finish')
}

(async () => {
  let tasks = []
  for (let i = 0; i < 1000; i++) {
    tasks.push(testUser(i))
  }
  await Promise.all(tasks).catch(console.log)
})()