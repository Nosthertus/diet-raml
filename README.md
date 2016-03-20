# Diet Raml Generator

[![Join the chat at https://gitter.im/Nosthertus/diet-raml-generator](https://badges.gitter.im/Nosthertus/diet-raml-generator.svg)](https://gitter.im/Nosthertus/diet-raml-generator?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

diet-raml-generator is a code generator for resources found in a raml file.
Raml version used is 1.0

#### This repository is currently on stop, due to bugs from raml-parser for raml version 1.0.. Any updates will be posted on gitter

### Version

0.6.0

### Installation

```sh
$ npm install diet-raml-generator -g
```

### Usage
```sh
$ diet-raml-generator -t test/api.raml -d test/routes
```

## Documentation

#### -d
The directory where to save the generated routes.

#### -t
The target raml file to read.
