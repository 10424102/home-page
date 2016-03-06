/*!
 * home-page's Gruntfile
 * Copyright 2013-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */

module.exports = function (grunt) {
  'use strict';

  // Force use of Unix newlines
  grunt.util.linefeed = '\n';

  RegExp.quote = function (string) {
    return string.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
  };

  var fs = require('fs');
  var path = require('path');

  var autoprefixerBrowsers = [
    "Android 2.3",
    "Android >= 4",
    "Chrome >= 20",
    "Firefox >= 24",
    "Explorer >= 8",
    "iOS >= 6",
    "Opera >= 12",
    "Safari >= 6"
  ];

  // Project configuration.
  grunt.initConfig({

    // Metadata.
    pkg: grunt.file.readJSON('package.json'),

    // Task configuration.
    clean: {
      dist: 'dist',
      docs: 'docs/dist'
    },

    jshint: {
      options: {
        jshintrc: 'src/js/.jshintrc'
      },
      grunt: {
        options: {
          jshintrc: 'grunt/.jshintrc'
        },
        src: ['Gruntfile.js', 'grunt/*.js']
      },
      core: {
        src: 'src/js/*.js'
      }
    },

    jscs: {
      options: {
        config: 'src/js/.jscsrc'
      },
      grunt: {
        src: '<%= jshint.grunt.src %>'
      },
      core: {
        src: '<%= jshint.core.src %>'
      }
    },

    concat: {
      core: {
        src: [
          // jquery
          'bower_components/jquery/dist/jquery.js',

          // bootstrap
          'bower_components/bootstrap/dist/js/bootstrap.js',
        ],
        dest: 'dist/js/project-w-ui.js'
      },
      home : {
        src: [
          'src/js/main.js'
        ],
        dest: 'dist/js/project-w-ui-home.js'
      },
    },

    uglify: {
      options: {
        preserveComments: 'some'
      },
      core: {
        src: '<%= concat.core.dest %>',
        dest: 'dist/js/project-w-ui.min.js'
      },
      home: {
        src: '<%= concat.home.dest %>',
        dest: 'dist/js/project-w-ui-home.min.js'
      },
    },

    less: {
      compileCore: {
        options: {
          strictMath: true,
          sourceMap: true,
          outputSourceFiles: true,
          sourceMapURL: 'project-w-ui.css.map',
          sourceMapFilename: 'dist/css/project-w-ui.css.map'
        },
        src: 'src/less/core/alpha-bundle.less',
        dest: 'dist/css/project-w-ui.css'
      },
      compileHome: {
        options: {
          strictMath: true,
          sourceMap: true,
          outputSourceFiles: true,
          sourceMapURL: 'project-w-ui-home.css.map',
          sourceMapFilename: 'dist/css/project-w-ui-home.css.map'
        },
        src: 'src/less/home/alpha-bundle.less',
        dest: 'dist/css/project-w-ui-home.css'
      }
    },

    autoprefixer: {
      options: {
        browsers: autoprefixerBrowsers
      },
      core: {
        options: {
          map: true
        },
        src: ['dist/css/project-w-ui.css']
      }
    },

    htmllint: {
      options: {
        ignore: [
          'Attribute "autocomplete" not allowed on element "button" at this point.',
          'Attribute "autocomplete" not allowed on element "input" at this point.',
          'Element "img" is missing required attribute "src".'
        ]
      },
      src: '_gh_pages/**/*.html'
    },

    bootlint: {
      options: {
        stoponerror: true
      },
      files: ['_gh_pages/**/*.html']
    },

    jekyll: {
      options: {
        config: '_config.yml'
      },
      docs: {},
      github: {
        options: {
          raw: 'github: true'
        }
      }
    },

    csslint: {
      options: {
        csslintrc: 'less/.csslintrc'
      },
      dist: [
        'dist/css/project-w-ui.css'
      ]
    },

    cssmin: {
      options: {
        compatibility: 'ie8',
        keepSpecialComments: '*',
        advanced: false
      },
      minifyCore: {
        src: 'dist/css/project-w-ui.css',
        dest: 'dist/css/project-w-ui.min.css'
      }
    },

    csscomb: {
      options: {
        config: 'less/.csscomb.json'
      },
      dist: {
        expand: true,
        cwd: 'dist/css/',
        src: ['*.css', '!*.min.css'],
        dest: 'dist/css/'
      }
    },

    copy: {
      fonts: {
        files: [
          {
            expand: true,
            flatten: true,
            filter: 'isFile',
            src: ['bower_components/**/fonts/**', 'assets/fonts/**'],
            dest: 'dist/fonts/'
          }
        ]
      },
      img: {
        files: [
          {
            expand: true,
            flatten: true,
            src: ['assets/img/*'],
            dest: 'dist/img/'
          }
        ]
      },
      js: {
        files: [
          {
            expand: true,
            flatten: true,
            src: ['bower_components/html5shiv/dist/*', ['bower_components/respond/dest/*']],
            dest: 'dist/js/'
          }
        ]
      },
      docs: {
        expand: true,
        cwd: 'dist/',
        src: [
          '**/*'
        ],
        dest: 'docs/dist/'
      }
    },

    watch: {
      src: {
        files: '<%= jshint.core.src %>',
        tasks: ['jshint:src', 'concat']
      },
      less: {
        files: 'src/less/*.less',
        tasks: 'less'
      }
    },

    exec: {
      npmUpdate: {
        command: 'npm update'
      }
    },

    compress: {
      main: {
        options: {
          archive: 'project-w-ui-<%= pkg.version %>-dist.zip',
          mode: 'zip',
          level: 9,
          pretty: true
        },
        files: [
          {
            expand: true,
            cwd: 'dist/',
            src: ['**'],
            dest: 'project-w-ui-<%= pkg.version %>-dist'
          }
        ]
      }
    }

  });


  // These plugins provide necessary tasks.
  require('load-grunt-tasks')(grunt, {scope: 'devDependencies'});
  require('time-grunt')(grunt);

  grunt.registerTask('less-compile', ['less']);

  grunt.registerTask('package-js', ['concat']);
  grunt.registerTask('package-css', ['less-compile', 'autoprefixer', 'csscomb']);
  grunt.registerTask('package', ['clean:dist', 'package-css', 'package-js', 'copy:fonts', 'copy:img', 'copy:js', 'copy:docs']);

  grunt.registerTask('dist-js', ['package-js', 'uglify']);
  grunt.registerTask('dist-css', ['package-css', 'cssmin']);
  grunt.registerTask('dist', ['clean:dist', 'dist-css', 'dist-js', 'copy:fonts', 'copy:img', 'copy:js', 'docs']);

  grunt.registerTask('default', ['package']);

  grunt.registerTask('docs', ['clean:docs', 'copy:docs', 'jekyll:docs', 'htmllint', 'bootlint']);

  grunt.registerTask('prep-release', ['dist', 'docs', 'jekyll:github', 'compress']);
};
