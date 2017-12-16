const baseRadius = 100;

function addDrum(ctx, options) {
  let drumSize = `${options.size}"`;
  let radius = (baseRadius * options.size) / options.largestSize;
  let font = `45px sans-serif`;
  let lugs = options.size > 8 ? 8 : 6;
  let interval = (Math.PI * 2) / lugs;
  let depth = 50;

  // bottom border
  ctx.beginPath();
  ctx.fillStyle = '#ddd';
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#222';
  drawEllipseByCenter(ctx, options.leftPosition, options.topPosition + depth, radius * 2, radius);
  ctx.fill();

  // left drum border
  ctx.beginPath();
  ctx.moveTo(options.leftPosition - radius, options.topPosition);
  ctx.lineTo(options.leftPosition - radius, options.topPosition + depth);
  ctx.stroke();

  // right drum border
  ctx.beginPath();
  ctx.moveTo(options.leftPosition + radius, options.topPosition);
  ctx.lineTo(options.leftPosition + radius, options.topPosition + depth);
  ctx.stroke();

  // drum body fill
  ctx.beginPath();
  ctx.fillStyle = '#ddd';
  ctx.fillRect(options.leftPosition - radius, options.topPosition, radius * 2, depth);
  ctx.fill();
  ctx.stroke();

  // surface - batter drumhead
  ctx.beginPath();
  ctx.fillStyle = '#fefefe';
  drawEllipseByCenter(ctx, options.leftPosition, options.topPosition, radius * 2, radius);
  ctx.fill();
  ctx.closePath();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#222';
  ctx.fillStyle = '#222';
  ctx.stroke();

  // text inside drum (drum size)
  ctx.font = font;
  let width = ctx.measureText(drumSize).width;
  let height = ctx.measureText('w').width;
  ctx.fillText(drumSize, options.leftPosition - (width / 2), options.topPosition + (height / 2));

  addText(ctx, 'batter', `${options.batter} Hz`, options.leftPosition);
  addText(ctx, 'reso', `${options.reso} Hz`, options.leftPosition);
  addText(ctx, 'note', `${options.note}`, options.leftPosition);

  // draw top lugs
  for (let i = 0; i < lugs; i++) {
    let angle = interval * i;
    let x = options.leftPosition + radius * Math.cos(angle);
    let y = options.topPosition + radius / 2 * Math.sin(angle);

    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }
  // draw bottom lugs
  for (let i = 0; i < (lugs / 2) + 1; i++) {
    let angle = interval * i;
    let x = options.leftPosition + radius * Math.cos(angle);
    let y = options.topPosition + depth + radius / 2 * Math.sin(angle);

    ctx.beginPath();
    ctx.fillStyle = '#666';
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }
}

function drawEllipse(ctx, x, y, w, h) {
  let kappa = 0.5522848;
  let ox = (w / 2) * kappa; // control point offset horizontal
  let oy = (h / 2) * kappa; // control point offset vertical
  let xe = x + w; // x-end
  let ye = y + h; // y-end
  let xm = x + w / 2; // x-middle
  let ym = y + h / 2; // y-middle

  ctx.beginPath();
  ctx.moveTo(x, ym);
  ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
  ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
  ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
  ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
  ctx.stroke();
}

function drawEllipseByCenter(ctx, cx, cy, w, h) {
  drawEllipse(ctx, cx - w / 2.0, cy - h / 2.0, w, h);
}

function addText(ctx, type, text, leftPosition) {
  ctx.font = '24px sans-serif';
  let width = ctx.measureText(text).width;
  let top = 60;

  switch (type) {
    case 'batter':
      top = 120;
      break;
    case 'reso':
      top = 350;
      break;
    case 'note':
    default:
      ctx.font = 'bold 32px sans-serif';
      ctx.fillStyle = '#999';
      top = 60;
      break;
  }

  ctx.fillText(text, leftPosition - (width / 2), top);
  ctx.fillStyle = '#222';
}

module.exports = {
  addDrum
};
