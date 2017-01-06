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

// Check macro
'(defun avgnum (n1 n2 n3) (/ (+ n1 n2 n3) 3))'
function checkMacro(input2) {
  var keyword = input2.slice(1, 6)
  if (keyword === 'defun') {
    var newInput = input2.slice(7)
    var name = elem(newInput)[0]
    var str = c(newInput)
    var parametersList = str[0] + ')'
    var body = '(' + str[1]
    macro(name, parametersList, body)
  }
}


function c(input3) {
  return input3.match(/\(.+\)/)[0].split(') (')
}
// console.log(c('defun avgnum (n1 n2 n3) (/ (+ n1 n2 n3) 3)'))

var objM = {}

//macro
function macro(name, parametersList, body) {
  objM[name] = '(lambda ' + parametersList + ' ' + body
}
//console.log(checkMacro('(defun avgnum (n1 n2 n3) (/ (+ n1 n2 n3) 3))'), [])

// Parser
var operators = ['+', '-', '*', '/', '>', '>=', '<', '<=']
var keywords = ['if', 'define', 'begin', 'set!', 'lambda', 'quote', 'sqr', 'sqrt', 'equal?', 'number?']
var next
function parse (input, arr) {
  if (input.startsWith('(')) {
    next = parse(input.slice(1), [])
    if (next[0].slice(1) === "") {
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

function elem(p) {
  var str = ""
  var sl = p[0]
  while(sl !== " " && sl !== ')') {
    str = str + sl
    sl = p.slice(1)[0]
    p = p.slice(1)
    if (sl === undefined) {
      break;
    }
  }
  return [str, p]
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
var obj = {
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
  var firstElem = input.shift()
  if (firstElem === 'define') {
    obj[input.shift()] = evaluator(input)
  }
  else if (firstElem === 'set!') {
    obj[input.shift()] = evaluator(input)
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
  if (obj[firstElem] !== undefined) {
    if (typeof obj[firstElem] === 'number') {
      return obj[firstElem]
    }
    fn = obj[firstElem]
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
      obj[firstElem[1][k]] = Number(input[k])
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
  if (objM[firstElem] !== undefined) {
    var m = '(' + objM[firstElem] + ' '
    var l = input.length
    for(var i = 0; i < l; ++i) {
      m += String(special([input[i]])) + ' '
    }
    m += ')'
    return special(parse(m, []))
  }
}

// console.log(special(parse('(define A 5)', [])))
// console.log(special(parse('A', [])))
// console.log(special(parse('(+ 2 (+ 1 1 1) A)', [])))
// console.log(special(parse('(if (+ 1 2) 2 (+ 2 2))', [])))
// console.log(special(parse('(set! A (+ A 1))', [])))
// console.log(special(parse('A', [])))
// console.log(special(parse('(quote 3)', [])))
// console.log(special(parse('(begin (set! x 5) (+ x 1))', [])))
// console.log((parse('((lambda (x y) (+ x y)) 1 6)', [])))
// console.log(special(parse('(define a (lambda (x y) (+ x y)))', [])))
// console.log(special(parse('(define (add a b) (+ a b))', [])))
// console.log(special(parse('((lambda (x) x) 1)', [])))
// console.log(special(parse('(number? "g")', [])))
// console.log('(define avgnum (lambda (n1 n2 n3) (/ (+ n1 n2 n3) 3)))')
// console.log((parse('(define avgnum (lambda (n1 n2 n3) (/ (+ n1 n2 n3) 3)))', [])))
// console.log(checkMacro('(defun add (n1 n2 n3) (+ n1 n2 n3))', []))
// console.log(special(parse('(add 1 2 3)', [])))
