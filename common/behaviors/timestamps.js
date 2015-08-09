export default (ctx, next) => {
  if (ctx.instance) {
    ctx.instance.updated = new Date();
    if (ctx.isNewInstance) {
      ctx.instance.created = new Date();
    }
  } else {
    ctx.data.updated = new Date();
  }
  next();
};
