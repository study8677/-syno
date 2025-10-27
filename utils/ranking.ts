
// Wilson Score Interval for Bernoulli parameter
function wilsonScore(up: number, down: number, z: number = 1.96): number {
    const n = up + down;
    if (n === 0) {
        return 0;
    }
    const p_hat = up / n;
    const term1 = p_hat + (z * z) / (2 * n);
    const term2 = z * Math.sqrt((p_hat * (1 - p_hat)) / n + (z * z) / (4 * n * n));
    const term3 = 1 + (z * z) / n;
    return (term1 - term2) / term3;
}

// Time decay function
function timeDecay(createdAt: string, halfLifeHours: number = 72): number {
    const now = new Date().getTime();
    const created = new Date(createdAt).getTime();
    const ageHours = (now - created) / (1000 * 60 * 60);
    return Math.pow(0.5, ageHours / halfLifeHours);
}

export function calculateHotScore(upvotes: number, downvotes: number, createdAt: string): number {
    const score = wilsonScore(upvotes, downvotes);
    const decay = timeDecay(createdAt);
    // Multiplying by a large number to make the score more readable
    return score * decay * 100;
}
