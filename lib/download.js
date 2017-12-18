// Built in mdoules
const fs = require('fs-extra');
const path = require('path');
const request = require('request');

// dependencies
const slack = require('slack');
const ora = require('ora');

// vars
const months = 'January, February, March, April, May, June, July, August, September, Octover, November, December'.split(', ');
const baseDir = './files';
const count = 20;

const USER_TOKEN = process.env.USER_TOKEN

// DO IT!
saveFiles(1);

function saveFiles(page) {
  let spinner = ora('Fetching batch' + page).start();

  getFiles({page: page, count: count})
    .then(function(data) {
      spinner.text = 'Got batch ' + page + ' - saving files';

      let lastPage = data.paging.pages === page;
      let batch = data.files.map(function(file) {
        let timing = new Date(parseInt(file.created + '000'));

        let year = timing.getFullYear().toString();
        let month = timing.getMonth().toString();
        let day = timing.getDate().toString();

        let fileName = [month + 1, day, year, file.id, file.name].join('-');
        let dir = path.join(baseDir, year, months[month]);
        let options = {
          url: file.url_private,
          headers: {
              'Authorization': 'Bearer ' + USER_TOKEN
          }
        };
        // With Promises:
        return fs.ensureDir(dir)
          .then(() => {
            let output = fs.createWriteStream(path.join(dir, fileName));
            return new Promise(function(resolve, reject) {
              request(options)
                .on('end', function(){
                  spinner.text = 'Saved ' + fileName;
                  resolve();
                })
                .pipe(output);
            });
          })
          .catch(err => {
            console.error(err)
          })
      })

      Promise.all(batch).then(function() {
        spinner.succeed(['Saved files', (page - 1) * count, '-', page * count, 'of', data.paging.total].join(' '));

        if (!lastPage) {
          saveFiles(page + 1)
        }
      });
    })
}


function getFiles(options) {
  let params = Object.assign({}, {token: USER_TOKEN}, options)
  return slack.files.list(params)
}
