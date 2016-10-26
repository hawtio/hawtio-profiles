# hawtio-profiles

## Setup

You need to install [Node.js](http://nodejs.org/) and the default global npm dependencies:

    $ npm install -g bower gulp 

Then install all the Node.js packages locally and update the Bower dependencies with:

    $ npm install
    $ bower update

Next you need to setup the `KUBERNETES_MASTER` environment variable to point to the Kubernetes master you want to run against. e.g.:

    export KUBERNETES_MASTER=https://$(minishift ip):8443

Where `minishift ip` returns the IP address or host running the Kubernetes master when using [Minishift](https://github.com/jimmidyson/minishift).

## Run

You can run the Web application with:

    $ gulp

And access the application at <http://localhost:9000>.

This watches for changes, then re-compiles sources and reloads the application.

To build the static site and serves it:

    $ gulp site serve-site

This is necessary in order to access the Hawtio JVM console.

## Development

### LiveReload

Much of the functionality is provided by other Hawtio plugins. It's possible to run builds of those plugins in parallel and watch your changes. For example, to hack on [hawtio-kubernetes](https://github.com/hawtio/hawtio-kubernetes), you can clone the `hawtio-kubernetes` repository and pass the `--out` flag to `gulp watch`, specifying the `libs/hawtio-kubernetes/dist/` as the output folder. More info in the `hawtio-kubernetes` [readme](https://github.com/hawtio/hawtio-kubernetes/blob/master/ReadMe.md), and other Hawtio plugins that support this.

### Dependencies

Make sure you're running with the latest code and plugins:

    $ git pull
    $ npm update
    $ bower update

Or:

    git pull && npm update && bower update

Windows pro-tip:

    $errorActionPreference='Stop'; git pull; npm update; bower update;

Also, make sure you keep your globally installed node programs up to date with:

    npm update -g

### Authentication

In case you need to disable OAuth authentication in development, you can use the `DISABLE_OAUTH` environment variable, e.g.:

    export DISABLE_OAUTH=true
