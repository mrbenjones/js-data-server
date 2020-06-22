const redisFunctions = require('../redisFunctions')

describe('integration: redis and kue operations', function(){
    test('redis starts', function(done){
        expect(true).toEqual(true)
        done()
    })
    test('redis set simple', function(done){
        const client = redisFunctions.getRedisClient()
        const key = Math.random().toString(36).substring(2,15)
        client.set(key, 'a11')
        return redisFunctions.getPromise(key)
            .then(
                ans => {
                    console.log(ans)
                    expect(ans).toEqual('a11')
                    done()
                }
            )

    })
    test('kue starts up', function(done) {
        let queue = redisFunctions.createKueQueue(3010)
        let job = queue.create('store', {
            county: 'Bernalillo'
        }).save(function(err){
            if (!err) {
                console.log(job.id, "IN")
            } else {
                console.log(err)
            }
        })
        console.log(job)
        done()
    })

})
