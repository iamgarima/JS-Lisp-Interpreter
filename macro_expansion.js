var macroS = {}

function macro (input) {
  var keyword = input.slice(1, 9)
  if (keyword === 'defmacro') {
    input = input.slice(10)
    var name = nameFunc(input)
    // console.log('name:', name)
    input = input.slice(name.length)
    var arg = argFunc(input)
    // console.log('arg:', arg)
    input = input.slice(arg.length + 1)
    var expArr = expFunc(input, [])
    // console.log('expArr:', expArr)
    expArr = expArr.map(function (val) {
      return '(lambda ' + arg + ' ' + val + ')'
    })
    // console.log(expArr)
    macroS[name] = expArr
    // console.log(macroS)
  }
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
// console.log(spaceParser(' (print num))'))

function check (input) {
  input = input.slice(1)
  var keyword = keywordFunc(input)
  // console.log('checkKeyword:', keyword)
  input = input.slice(keyword.length)
  input = spaceParser(input)
  // console.log('checkInput:', input)
  var macroArg = input.slice(0, input.length - 1)
  // console.log('macroArg:', macroArg)
  var beginArr = macroS[keyword].map(function (value) {
    return '(' + value + ' ' + macroArg + ')'
  })
  // console.log('beginArr:', beginArr)
  var str = ''
  var j = 0
  while (j < beginArr.length) {
    str = str + beginArr[j] + ' '
    ++j
  }
  return '(begin ' + str.trim() + ')'
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

console.log(macro('(defmacro setTo10(num ber) (define num 10) (print num))'))
console.log(check('(setTo10 5 10)'))
