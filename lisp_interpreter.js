var macroS = {}

function macro (input) {
  var keyword = input.slice(1, 9)
  if (keyword === 'defmacro') {
    input = input.slice(10)
    var name = nameFunc(input)
    input = input.slice(name.length)
    var arg = argFunc(input)
    input = input.slice(arg.length + 1)
    var expArr = expFunc(input, [])
    expArr = expArr.map(function (val) {
      return '(lambda ' + arg + ' ' + val + ')'
    })
    macroS[name] = expArr
  }
}

function checkmacro (input) {
  if (input.slice(1, 9) === 'defmacro') {
    return macro(input)
  }
  return check(input)
}

function nameFunc (input) {
  var count = 0
  var i = 0
  while (input[i] !== '(') {
    ++count
    ++i
  }
  return input.slice(0, count)
}

function argFunc (input) {
  var count = 0
  var i = 0
  while (input[i] !== ')') {
    ++count
    ++i
  }
  return input.slice(0, count + 1)
}

function expFunc (input, argsArr) {
  var count = 1
  var eCount = 1
  var i = 1
  if (input.length === 1) {
    return argsArr
  }
  while (count !== 0) {
    ++eCount
    if (input[i] === '(') {
      ++count
      ++i
    }
    else if (input[i] === ')') {
      --count
      ++i
    }
    ++i
  }
  argsArr.push(input.slice(0, eCount))
  input = input.slice(eCount)
  input = spaceParser(input)
  return expFunc(input, argsArr)
}

function spaceParser (input) {
  var count = 0
  var i = 0
  while (input[i] === ' ') {
    ++count
    ++i
  }
  return input.slice(count)
}

function check (input) {
  if (input[0] === '(') {
    input = input.slice(1)
    var keyword = keywordFunc(input)
    if (macroS[keyword] === undefined) {
      return '(' + input
    }
    input = input.slice(keyword.length)
    input = spaceParser(input)
    var macroArg = input.slice(0, input.length - 1)
    var beginArr = macroS[keyword].map(function (value) {
      return '(' + value + ' ' + macroArg + ')'
    })
    var str = ''
    var j = 0
    while (j < beginArr.length) {
      str = str + beginArr[j] + ' '
      ++j
    }
    return '(begin ' + str.trim() + ')'
  }
  return input
}

function keywordFunc (input) {
  var count = 0
  var i = 0
  while (input[i] !== ' ') {
    ++count
    ++i
  }
  return input.slice(0, count)
}

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
}

// console.log(special(parse(checkmacro('(define A 5)'), [])))
// console.log(special(parse(checkmacro('A'), [])))
// console.log(special(parse(checkmacro('(+ 2 (+ 1 1 1))'), [])))
// console.log(special(parse(checkmacro('(if (+ 1 2) 2 (+ 2 2))'), [])))
// console.log(special(parse(checkmacro('(set! A (+ A 1))'), [])))
// console.log(special(parse(checkmacro('A'), [])))
// console.log(special(parse(checkmacro('(quote 3)'), [])))
// console.log(special(parse(checkmacro('(begin (set! x 5) (+ x 1))'), [])))
// console.log(special(parse(checkmacro('((lambda (x y) (+ x y)) 1 6)'), [])))
// console.log(special(parse(checkmacro('(define a (lambda (x y) (+ x y)))'), [])))
// console.log(special(parse(checkmacro('((lambda (x) x) 1)'), [])))
// console.log(special(parse(checkmacro('(number? "g")'), [])))
// console.log((parse(checkmacro('(define avgnum (lambda (n1 n2 n3) (/ (+ n1 n2 n3) 3)))'), [])))
// console.log(special(parse(checkmacro('(defmacro defun(name args body) (lambda args body))'), [])))
// console.log(checkmacro('(defun add (n1 n2 n3) (+ n1 (+ n2 n2) (+ n1 n1) n3))'))
// console.log(special(parse(checkmacro('(add 1 2 3)'), [])))
// console.log(special(parse(checkmacro('(defmacro setTo10(num) (define num 10) (* num num))'), [])))
// console.log(special(parse(checkmacro('(setTo10 5)'), [])))
// console.log(macroS)
