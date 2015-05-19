'use strict';

var async = require('async');

/**
 * Extend Mongoose Models to paginate queries
 * @param   {Object}   q            Search query
 * @param   {Object}   options      Query options
 * @param   {function} callback     function(error, page)
 * @returns {Object}   results      contains: results, pageCount, itemCount
 */
function paginate(q, options, callback) {
    var model = this;

    options = options || {};
    callback = callback || function() {};

    var columns = options.columns || null;
    var sort = options.sort || null;
    var lean = options.lean || false;
    var populate = options.populate || null;
    var pageNumber = options.page || 1;
    var resultsPerPage = options.limit || 10;
    var skipFrom = (pageNumber * resultsPerPage) - resultsPerPage;

    var query = model.find(q);

    if (columns !== null) {
        query = query.select(options.columns);
    }
    query = query.skip(skipFrom).limit(resultsPerPage);
    if (sort !== null) {
        query.sort(sort);
    }
    if (populate) {
        if (Array.isArray(populate)) {
            populate.forEach(function(field) {
                query = query.populate(field);
            });
        }
        else {
            query = query.populate(populate);
        }
    }
    if (lean) {
        query.lean();
    }

    async.parallel({
        results: function(callback) {
            query.exec(callback);
        },
        count: function(callback) {
            model.count(q, function(err, count) {
                callback(err, count);
            })
        }
    }, function(error, data) {
        if (error) {
            return callback(error);
        }

        var page = {
            results: data.results,
            pageCount: Math.ceil(data.count / resultsPerPage) || 1,
            itemCount: data.count
        };

        callback(null, page);
    });
}

module.exports = function(schema) {
    schema.statics.paginate = paginate;
}
