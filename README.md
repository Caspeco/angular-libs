# Caspeco Angular libs

This will be a collection of OpenSource components for various Angular.io related things.  

## [NgPhoenix](projects/ng-phoenix/README.md)

An angular service meant to wrap the JavaScript [phoenix client](https://github.com/phoenixframework/phoenix/blob/master/assets/js/phoenix.js) while adding an [rxjs](https://github.com/ReactiveX/rxjs) ReplaySubject to it.

## Development server

Run `ng serve <project-name> [-c <config-name>]` for a dev server for a specific application project. Navigate to `http://localhost:4200/`. Omitting `<project-name>` will attempt to serve the default project, which might not be an application but a library project, at which point it will fail with the error `An unhandled exception occurred: No projects support the 'serve' target`. The app will automatically reload if you change any of the source files.

To develop a library project on the other hand you would run `ng test --project <project-name>` to only run the current library project's tests. Omitting the project flag will run all tests.

## Code scaffolding

Run `ng generate --project <project-name> component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`. Omitting `--project <project-name>` will create the resource in the default project set in the [angular.json](angular.json) file.

## Build

Run `ng build <project-name>` to build the project with name `<project-name>`. Omitting `<project-name>` will build the default project in the [angular.json](angular.json) file. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test [<project-name>]` to execute the unit tests via [Karma](https://karma-runner.github.io), where if you omit `<project-name>` it will run all tests in all subprojects.

## LICENSE

See [LICENSE](LICENSE)

## Further help (Angular)

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
