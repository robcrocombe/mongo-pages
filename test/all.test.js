/*
 * @list dependencies
 */
var vows = require('vows'),
    assert = require('assert'),
    mongoose = require('mongoose'),
    mongoosePaginate = require('../lib/mongo-pages');

/*
 * connect to MongoDB with Mongoose
 */
mongoose.connect(process.env.MONGO_DB || 'mongodb://localhost/test');

/*
 * @tests setup
 */
var TestSchema = new mongoose.Schema({
    id: mongoose.Schema.ObjectId,
    title: String,
    date: Date,
    child: {
        type: mongoose.Schema.ObjectId,
        ref: 'TestSubEntries'
    }
});

TestSchema.plugin(mongoosePaginate);

var TestEntry = mongoose.model('TestEntries', TestSchema);

var TestSubSchema = new mongoose.Schema({
    id: mongoose.Schema.ObjectId,
    title: String,
    date: Date
});

TestSubSchema.plugin(mongoosePaginate);

var TestSubEntry = mongoose.model('TestSubEntries', TestSubSchema);

function setup(callback) {
    var newSubEntry = new TestSubEntry({
        title: 'SubItem #1',
    });
    newSubEntry.save(function(error, subEntry) {
        var complete = 1;
        for (var i = 1; i <= 100; i++) {
            var newEntry = new TestEntry({
                title: 'Item #' + i,
                child: subEntry._id,
            });
            newEntry.save(increment(complete, callback));
            complete++;
        }
    });
}

/*
 * teardown
 */

function teardown(callback) {
    TestSubEntry.remove({}, function(error) {
        if (error) {
            callback(error, null);
        } else {
            TestEntry.find({}, function(error, results) {
                if (error) {
                    callback(error, null);
                } else {
                    var complete = 1;
                    for (var result in results) {
                        results[result].remove(increment(complete, callback))
                        complete++;
                    }
                }
            });
        }
    });
}

function increment(complete, callback) {
    return function(error) {
        if (error) {
            console.error(error);
        } else {
            if (complete === 100) {
                callback(null, 100);
            }
        }
    }
}

/*
 * @tests vows
 */
vows.describe('pagination module basic tests')

.addBatch({
    'when requiring `mongoose-paginate`': {
        topic: function() {
            return mongoose;
        },
        'there should be no errors and paginate should be an object': function(topic) {
            assert.equal(typeof(topic), 'object');
        }
    }
})

.addBatch({
    'when removing all documents in TestEntry collection': {
        topic: function() {
            TestEntry.remove({}, this.callback);
        },
        'there should be no errors': function(error, numRemoved) {
            assert.equal(error, null);
        }
    }
})

.addBatch({
    'when removing all documents in TestSubEntry collection': {
        topic: function() {
            TestSubEntry.remove({}, this.callback);
        },
        'there should be no errors': function(error, numRemoved) {
            assert.equal(error, null);
        }
    }
})

.addBatch({
    'when creating 100 dummy documents with our test mongodb string': {
        topic: function() {
            setup(this.callback);
        },
        'there should be no errors and resultCount should be 100': function(error, resultCount) {
            assert.equal(error, null);
            assert.equal(resultCount, 100);
        }
    }
})

.addBatch({
    'when paginating TestEntry querying for all documents, with page 1, 10 results per page': {
        topic: function() {
            TestEntry.paginate({}, {
                page: 1,
                limit: 10,
                columns: 'title'
            }, this.callback);
        },
        'there should be no errors': function(error, results) {
            assert.equal(error, null);
        },
        'results.length should be 10': function(error, results) {
            assert.equal(results.paginatedResults.length, 10);
        },
        'the first result should contain the correct index #(1)': function(error, results) {
            assert.equal(results.paginatedResults[0].title, 'Item #1');
        }
    }
})

.addBatch({
    'when paginating TestEntry querying for all documents, with page 2, 10 results per page': {
        topic: function() {
            TestEntry.paginate({}, {
                page: 2,
                limit: 10,
                columns: 'title'
            }, this.callback);
        },
        'there should be no errors': function(error, results) {
            assert.equal(error, null);
        },
        'results.length should be 10': function(error, results) {
            assert.equal(results.paginatedResults.length, 10);
        },
        'the first result should contain the correct index #(11)': function(error, results) {
            assert.equal(results.paginatedResults[0].title, 'Item #11');
        },
        'there should be 100 items as results': function(error, results) {
            assert.equal(results.itemCount, 100);
        }
    }
})

.addBatch({
    'when paginating TestEntry querying for all documents, with page 10, 11 results per page': {
        topic: function() {
            TestEntry.paginate({}, {
                page: 10,
                limit: 10,
                columns: 'title'
            }, this.callback);
        },
        'there should be no errors': function(error, results) {
            assert.equal(error, null);
        },
        'results.length should be 10': function(error, results) {
            assert.equal(results.paginatedResults.length, 10);
        },
        'the first result should contain the correct index #(100)': function(error, results) {
            assert.equal(results.paginatedResults[9].title, 'Item #100');
        }
    }
})

.addBatch({
    'when paginating TestEntry querying for all documents, with page 2, 10 results per page with populate and without columns': {
        topic: function() {
            TestEntry.paginate({}, {
                page: 2,
                limit: 10,
                populate: 'child'
            }, this.callback);
        },
        'there should be no errors': function(error, results) {
            assert.equal(error, null);
        },
        'results.length should be 10': function(error, results) {
            assert.equal(results.paginatedResults.length, 10);
        },
        'the first result should contain the correct index #(11)': function(error, results) {
            assert.equal(results.paginatedResults[0].title, 'Item #11');
        },
        'the first result should contain the correct SubItem #(1)': function(error, results) {
            assert.equal(results.paginatedResults[0].child.title, 'SubItem #1');
        }
    }
})

.addBatch({
    'when paginating TestEntry querying for all documents, with page 1, 10 results per page, sorting reverse by title': {
        topic: function() {
            TestEntry.paginate({}, {
                page: 1,
                limit: 10,
                sort: {
                    title: -1
                }
            }, this.callback);
        },
        'there should be no errors': function(error, results) {
            assert.equal(error, null);
        },
        'results.length should be 10': function(error, results) {
            assert.equal(results.paginatedResults.length, 10);
        },
        'the first result should contain the correct index #(99)': function(error, results) {
            assert.equal(results.paginatedResults[0].title, 'Item #99');
        }
    }
})

.addBatch({
    'when deleting all of our 100 dummy documents with our test mongodb string': {
        topic: function() {
            teardown(this.callback);
        },
        'there should be no errors and resultCount should be a number': function(error, resultCount) {
            assert.equal(error, null);
            assert.equal(resultCount, 100);
        },
        teardown: function() {
            mongoose.connection.close();
        }
    }
})
.export(module);
