// splitter function first add the spaces around both the parenthesis
// and then split them on space thus separating each element in input
// console.log(splitter('(+ 2 3)'))
// function splitter (input) {
//   return input.replace(/\(/g, ' ( ')
//               .replace(/\)/g, ' ) ')
//               .split(' ')
// }

// tokenize function removes the empty strings and the parenthesis elements
// from the array and put each expression in a new array taking consideration
// of the parenthesis
// console.log(tokenize(splitter('(+ 2 3)'), []))
// function tokenize (input, list) {
//   var firstElem = input.shift()
//   if (firstElem === undefined) {
//     if (typeof list[0] !== 'object') {
//       return list
//     }
//     return list.pop()
//   }
//   if (firstElem === '') {
//     return tokenize(input, list)
//   }
//   if (firstElem === '(') {
//     list.push(tokenize(input, []))
//     return tokenize(input, list)
//   }
//   if (firstElem === ')') {
//     return list
//   }
//   list.push(firstElem)
//   return tokenize(input, list)
// }

// object for storing the macros defined
var macroStore = {}

// Check macro
function checkMacro (input) {
  var keyword = input.slice(1, 6)
  if (keyword === 'defun') {
    var newInput = input.slice(7)
    var name = elem(newInput)[0]
    var parametersList = params(newInput)
    var body = input.slice(keyword.length + name.length + parametersList.length + 3)
    macro(name, parametersList, body)
  }
  else {
    return input
  }
}

// extract parameters from the given input
function params (input) {
  var ln = input.length
  for (var j = 0; j < ln; ++j) {
    var str = ''
    if (input[j] === '(') {
      while (input[j] !== ')') {
        str += input[j]
        ++j
      }
      str = str + ')'
      return str
    }
  }
}
// console.log(params('avgnum (n1 n2 n3) (/ (+ n1 n2 n3) (+ n1 n2 n3))'))
// console.log(params('avgnum (n1 n2 n3) (/ (+ n1 n2 n3) (+ n1 n2 (+ n1 n3) n3)))'))

// stores the macro as lambda function in macroStore
function macro (name, parametersList, body) {
  macroStore[name] = '(lambda ' + parametersList + ' ' + body
}
// console.log(checkMacro('(defun avgnum (n1 n2 n3) (/ (+ n1 n2 n3) (+ n1 n2 (+ n1 n3) n3)))'), [])
// console.log(macroStore['avgnum'])

// Parser
var operators = ['+', '-', '*', '/', '>', '>=', '<', '<=']
var next
function parse (input, arr) {
  if (input === undefined) { return undefined }
  if (input.startsWith('(')) {
    next = parse(input.slice(1), [])
    if (next[0].slice(1) === '') {
      return next[1]
    }
    arr = arr.concat([next[1]])
    return parse(next[0].slice(1), arr)
  }
  if (input.startsWith(')')) {
    return [input, arr]
  }
  var result
  result = factory_parser(input).pop()
  if (result[1] === '') {
    return arr.concat(result[0])
  }
  return parse(result[1], arr.concat(result[0]))
}

function factory_parser (input) {
  var fnArr = [number_parser(input), opertor_parser(input), keyword_parser(input), space_parser(input)]
  return fnArr.filter(function (value) {
    return (typeof value === 'object')
  })
}

function elem (input) {
  var str = ''
  var sl = input[0]
  while (sl !== ' ' && sl !== ')') {
    str = str + sl
    sl = input.slice(1)[0]
    input = input.slice(1)
    if (sl === undefined) {
      break
    }
  }
  return [str, input]
}

function number_parser (input) {
  var first = elem(input)
  return (!isNaN(Number(first[0]))) ? first : false
}

function opertor_parser (input) {
  var first = elem(input)
  return (operators.indexOf(first[0]) !== -1) ? first : false
}

function keyword_parser (input) {
  var first = elem(input)
  return (typeof first[0] === 'string') ? first : false
}

function space_parser (input) {
  return (input[0] === ' ') ? [[], input.slice(1)] : false
}

// object having predefined and user-defined keywords
var store = {
  '+': function (a, b) {
    return a + b
  },
  '-': function (a, b) {
    return a - b
  },
  '*': function (a, b) {
    return a * b
  },
  '/': function (a, b) {
    return a / b
  },
  '>': function (a, b) {
    return a > b
  },
  '<': function (a, b) {
    return a < b
  },
  '>=': function (a, b) {
    return a >= b
  },
  '<=': function (a, b) {
    return a <= b
  },
  'equal?': function (a, b) {
    return (a === b)
  },
  'number?': function (a) {
    return !isNaN(a)
  },
  'sqr': function (a) {
    return a * a
  },
  'sqrt': function (a) {
    return Math.sqrt(a)
  }
}

// function for special statements like define
// console.log(special(parse('(define A 5)', [])))
function special (input) {
  if (input === undefined) { return undefined }
  var firstElem = input.shift()
  if (firstElem === 'define') {
    store[input.shift()] = evaluator(input)
  }
  else if (firstElem === 'set!') {
    store[input.shift()] = evaluator(input)
  }
  else if (firstElem === 'if') {
    var emp = []
    if (special(input.shift())) {
      emp.push(input.shift())
      return special(emp)
    }
    input.shift()
    emp.push(input.shift())
    return special(emp)
  }
  input.unshift(firstElem)
  return evaluator(input)
}

// evaluator function for evaluating expressions, variables and literals
function evaluator (input) {
  var firstElem = input.shift()
  var argsArr = []
  var fn

  if (typeof Number(firstElem) === 'number' && Number(firstElem) === Number(firstElem)) {
    return Number(firstElem)
  }
  if (store[firstElem] !== undefined) {
    if (typeof store[firstElem] === 'number') {
      return store[firstElem]
    }
    fn = store[firstElem]
    var l = input.length
    for (var i = 0; i < l; ++i) {
      argsArr.push(evaluator(input))
    }
    if (argsArr.length === 1) {
      return fn(argsArr.pop())
    }
    return argsArr.reduce(fn)
  }
  if (firstElem[0] === 'lambda') {
    var ln = firstElem[1].length
    for (var k = 0; k < ln; ++k) {
      store[firstElem[1][k]] = Number(input[k])
    }
    if (typeof firstElem[2] === 'object') {
      return special(firstElem[2])
    }
    var arr = []
    arr.push(firstElem[2])
    return special(arr)
  }
  if (typeof firstElem === 'object') {
    return evaluator(firstElem)
  }
  if (firstElem === 'quote') {
    return input.shift()
  }
  if (firstElem === 'begin') {
    var len = input.length
    for (var j = 0; j < len; ++j) {
      if (j === len - 1) {
        return special(input.shift())
      }
      special(input.shift())
    }
  }
  if (macroStore[firstElem] !== undefined) {
    var m = '(' + macroStore[firstElem] + ' '
    var length = input.length
    for (var c = 0; c < length; ++c) {
      m += String(special([input[c]])) + ' '
    }
    m += ')'
    return special(parse(m, []))
  }
}

// console.log(special(parse(checkMacro('(define A 5)'), [])))
// console.log(special(parse(checkMacro('A'), [])))
// console.log(special(parse(checkMacro('(+ 2 (+ 1 1 1))', []))))
// console.log(special(parse('(if (+ 1 2) 2 (+ 2 2))', [])))
// console.log(special(parse('(set! A (+ A 1))', [])))
// console.log(special(parse('A', [])))
// console.log(special(parse('(quote 3)', [])))
// console.log(special(parse('(begin (set! x 5) (+ x 1))', [])))
// console.log(special(parse('((lambda (x y) (+ x y)) 1 6)', [])))
// console.log(special(parse('(define a (lambda (x y) (+ x y)))', [])))
// console.log(special(parse('((lambda (x) x) 1)', [])))
// console.log(special(parse('(number? "g")', [])))
// console.log('(define avgnum (lambda (n1 n2 n3) (/ (+ n1 n2 n3) 3)))')
// console.log((parse('(define avgnum (lambda (n1 n2 n3) (/ (+ n1 n2 n3) 3)))', [])))
 console.log(special(parse(checkMacro('(defun add (n1 n2 n3) (+ n1 (+ n2 n2) (+ n1 n1) n3))'), [])))
 console.log(special(parse('(add 1 2 3)', [])))
