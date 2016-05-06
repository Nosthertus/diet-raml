# Diet Raml Generator

[![Join the chat at https://gitter.im/Nosthertus/diet-raml-generator](https://badges.gitter.im/Nosthertus/diet-raml-generator.svg)](https://gitter.im/Nosthertus/diet-raml-generator?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

diet-raml-generator is a code generator for resources found in a raml file.
Raml version used is 0.8

### Installation

```sh
$ npm install diet-raml-generator -g
```

### Usage
```sh
$ diet-raml-generator 
Options:
  -t, --target     root raml file directory                  [string] [required]
  -d, --directory  directory where to generate resources
                                            [string] [default: "raml-resources"]

Examples:
  Usage: diet-raml-generator -t api.raml -d routes/raml-resources
```

### Documentation

**-d --directory**
*default:* raml-resources
The directory where to save the generated routes.

**-t --target**
*default:* null
The target raml file to read.

### F.A.Q
**Will the generator fully support to RAML 1.0?**
In time, when all bugs found from the parser which prevents the generator to fully work are fixed.. if i have time, i will work for 1.0 version, if anyone wants to help me with this project, i will gladly check and merge pull requests

##License
M.I.T