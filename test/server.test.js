var assert = require('assert')
, app = require('app');

module.exports = {
    'test server': function() {
        app.observe(__dirname + '/fixture/test.md');
        assert.response(app,
            { url: '/' },
            {
                status: 200,
                body: /<h1>hoge<\/h1>/
            }
        );
        app.unobserve(); // TODO
    }
};
