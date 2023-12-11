import express from 'express';
import {createCanvas} from 'canvas';

const app = express();
const port = 3000;

app.use(express.json());
app.post('/downloadRingChart', async (req, res) => {
    const {data} = req.body;

    if (!data || typeof data !== 'object') {
        return res.status(400).json({error: 'Invalid data format'});
    }

    const categories = Object.keys(data);
    const percentages = Object.values(data);
    const canvas = createCanvas(400, 500);
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = (canvas.height - 100) / 2;
    const outerRadius = 150;
    const innerRadius = 75;

    let startAngle = 35;
    const categoryColors = [];

    percentages.forEach(percentage => {
        const sliceAngle = (percentage / 100) * 2 * Math.PI;
        const categoryColor = getRandomColor();
        categoryColors.push(categoryColor);

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, outerRadius, startAngle, startAngle + sliceAngle);
        ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = categoryColor;
        ctx.fill();

        startAngle += sliceAngle;
    })

    const legendX = 50;
    const legendY = centerY + outerRadius + 20;
    const legendItemHeight = 20;
    const labelOffset = 150;

    for (let i = 0; i < categories.length; i++) {
        const legendItemY = legendY + i * legendItemHeight;

        ctx.fillStyle = categoryColors[i];
        ctx.fillRect(legendX, legendItemY, 15, 15);

        ctx.fillStyle = 'black';
        ctx.font = '14px "Open Sans", sans-serif';
        const label = categories[i];
        ctx.fillText(label, legendX + 20, legendItemY + 12);

        const percentageText = `${percentages[i].toFixed(2)}%`;
        const percentageTextWidth = ctx.measureText(percentageText).width;
        ctx.fillText(percentageText, legendX + 150 - percentageTextWidth + labelOffset, legendItemY + 12);
    }

    const pngBuffer = canvas.toBuffer('image/png');
    res.set('Content-Type', 'image/png');
    res.send(pngBuffer);
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
