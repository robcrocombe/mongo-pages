
# mongo-pages

> Mongoose ORM (NodeJS/MongoDB) Document Query Pagination

This is a fork of Edward Hotchkiss's [mongoose-paginate](https://github.com/edwardhotchkiss/mongoose-paginate) package, with some additions needed for the [CS Blogs](https://github.com/csblogs) project.

To be used in combination with view pagination middleware such as [express-paginate](https://github.com/niftylettuce/express-paginate).

## Installation

```bash
npm install -S mongo-pages
```

## Usage

#### Basic

```js

/*
 * basic example usage of `mongoose-pagination`
 * querying for `all` {} items in `MyModel`
 * paginating by second page, 10 items per page (10 results, page 2)
 */

var mongoosePaginate = require('mongoose-paginate');

MyModel.plugin(mongoosePaginate)

MyModel.paginate({}, {
    page: 2,
    limit: 10
    }, function(error, results) {
      if (error) {
        console.error(error);
      } else {
        console.log('Pages:', results.pageCount);
        console.log(results.paginatedResults);
      }
});

```

#### Advanced

```js

/*
 * advanced example usage of `mongoose-pagination`
 * querying for `{ columns: 'title', { populate: 'some_ref' }, { sortBy : { title : -1 } }` items in `MyModel`
 * paginating by second page, 10 items per page (10 results, page 2)
 */

var mongoosePaginate = require('mongoose-paginate');

MyModel.plugin(mongoosePaginate)

MyModel.paginate({}, {
    page: 2,
    limit: 10,
    columns: 'title',
    populate: 'some_ref',
    sortBy: { title : -1 }
    }, function(error, results) {
      if (error) {
        console.error(error);
      } else {
        console.log('Pages:', results.pageCount);
        console.log(results.paginatedResults);
      }
});

```

### Author: [Edward Hotchkiss][0]

[0]: http://edwardhotchkiss.com/


### Contributors

* [Rob Crocombe](https://github.com/robcrocombe)
* [Nick Baugh](https://github.com/niftylettuce)

