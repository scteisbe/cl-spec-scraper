var _ = require('lodash');
var fs = require('fs');
var request = require('request');
var Xray = require('x-ray');
var x = Xray({
  filters: {
    labeled: function (value) {
      return typeof value === 'string' ? value.split(':')[1] : value
    }
  }
});

var url = 'http://www.cablelabs.com/wp-admin/admin-ajax.php';
var html = '';
var results = [];
var currentPage = 1;
var maxPage = 3;

console.log("Running");
getNextPage();

function getNextPage(){
  if (currentPage <= maxPage) {
    console.log("Requesting page " + currentPage + " of " + maxPage);
    request.post({url: url, form: {action:'specification_filter_action', paged:currentPage}}, function(err, response, body){
      if (!err && response.statusCode == 200) {
        r = JSON.parse(body);
        maxPage = r.total_pages || 0;

        x(r.data, 'li', [{
          url: 'a.row-download@href',
          title: '.res1 strong',
          type: '.res5 p | labeled',
          version: '.res3 p | labeled',
          designation: '.res4 p | labeled'
        }])(function(err, obj) {
          results = _.concat(results, obj);
          console.log(obj.length + " results");
          if (obj.length) {
            fs.writeFile("results/cl-specifications.json", JSON.stringify(results), function(err) {
              if(err) {
                return console.log(err);
              }
            }); 
          } else {
            currentPage = 0;
            console.log ("Something went wrong");
          }
        })

        currentPage++;
        getNextPage();
      }
    })
  } else {
    console.log (results);
    console.log (results.length + " total results");
  }
}
