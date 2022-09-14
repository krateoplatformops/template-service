const parse = (data) => {
  const props = { ...data.spec.deployment }
  delete props.title
  delete props.description

  const p = Object.keys(props).map((x) => {
    return {
      ...props[x],
      key: x
    }
  })

  const w = {
    title: data.spec.deployment.title,
    description: data.spec.deployment.description,
    properties: p
  }
  data.spec.widgets = [w, ...data.spec.widgets]

  return data
}

module.exports = {
  parse
}
