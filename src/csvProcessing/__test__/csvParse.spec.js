const countyDataFiles = require('../countyDataFiles')

describe('integration: parse Json from csv', function(){
    test('rollsThrough records', function(done){
        let stateRecords = []

        return  countyDataFiles.rawRecords('../covid-19-data/us-counties.csv', countyDataFiles.getStateCountyFilter('New Mexico'),
        countyDataFiles.addNMHealthRegion,
        countyDataFiles.accumulatorForArray(stateRecords)
        )
            .then(
                array => {
                    let counts = countyDataFiles.addByDateAndRegion(array)
                    console.log(JSON.stringify(counts, null, 4))
                    done()
                }
            )

        // let result = countyDataFiles.addByDateAndRegion(stateRecords)
        // console.log(JSON.stringify(result, null, 4))
        // expect(true).toEqual(true)
    })
})
