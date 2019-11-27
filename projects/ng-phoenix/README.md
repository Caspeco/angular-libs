# NgPhoenix

An angular service meant to wrap the JavaScript [phoenix client](https://github.com/phoenixframework/phoenix/blob/master/assets/js/phoenix.js) while adding an [rxjs](https://github.com/ReactiveX/rxjs) Subject to it.

Requires version 1.4.11 of Phoenix, but may work with versions 1.4.0-1.4.10 also, though it has not been tested.

## Code scaffolding

Run `ng generate component component-name --project ng-phoenix` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module --project ng-phoenix`.
> Note: Don't forget to add `--project ng-phoenix` or else it will be added to the default project in your `angular.json` file. 

## TODO

- [ ] Add a basic example
- [ ] Add a Presence example
- [ ] Add a generation schematic for a consumer service
- [ ] More tests

## Build

Run `ng build ng-phoenix` to build the project. The build artifacts will be stored in the `dist/` directory.

## Publishing

After building your library with `ng build ng-phoenix`, go to the dist folder `cd dist/ng-phoenix` and run `npm publish`. Do NOT do this lightly, as once a package has been published that name and version can never be used again, even if you unpublish it.

## Running unit tests

Run `ng test ng-phoenix` to execute the unit tests via [Karma](https://karma-runner.github.io).

