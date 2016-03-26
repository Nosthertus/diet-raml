# Diet Raml Generator

[![Join the chat at https://gitter.im/Nosthertus/diet-raml-generator](https://badges.gitter.im/Nosthertus/diet-raml-generator.svg)](https://gitter.im/Nosthertus/diet-raml-generator?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

diet-raml-generator is a code generator for resources found in a raml file.
Raml version used is 0.8

## Version

0.6.0

### Installation

```sh
$ npm install diet-raml-generator -g
```

### Usage
```sh
$ diet-raml-generator -t test/api.raml -d test/routes
```

### Documentation

**-d**
The directory where to save the generated routes.

**-t**
The target raml file to read.

### F.A.Q
**Why default branch is 0.8?**
This repository was originally being developed for RAML 1.0, but due to some bugs found on the parser, I had to adapt the code for 0.8 version.

**Will the generator fully support to RAML 1.0?**
In time, when all bugs found from the parser which prevents the generator to fully work are fixed.. if i have time, i will work for 1.0 version, if anyone wants to help me with this project, i will gladly check and merge pull requests

##License
M.I.T