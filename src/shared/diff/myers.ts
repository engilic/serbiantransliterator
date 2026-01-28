// src/shared/diff/myers.ts
/**
 * Myers Diff Algorithm
 *
 * Implementacija minimalnog Myers diff algoritma za poređenje stringova.
 * Koristi se za preview režim "diff" i "side-by-side" prikaze.
 */

export type DiffOp = { type: "equal" | "insert" | "delete"; value: string };

/**
 * Myers diff algoritam za dva niza stringova (tokeni).
 * @param a - Originalni niz tokena
 * @param b - Novi niz tokena
 * @returns Niz diff operacija (equal, insert, delete)
 */
export function myersDiff(a: string[], b: string[]): DiffOp[] {
    const n = a.length;
    const m = b.length;
    const max = n + m;

    // v[k] = x; k je pomeren za +max
    const v: number[] = new Array(2 * max + 1).fill(0);
    const trace: number[][] = [];

    for (let d = 0; d <= max; d++) {
        trace.push(v.slice());

        for (let k = -d; k <= d; k += 2) {
            const km = k + max;

            let x: number;
            if (k === -d || (k !== d && v[km - 1] < v[km + 1])) {
                // insert (down)
                x = v[km + 1];
            } else {
                // delete (right)
                x = v[km - 1] + 1;
            }

            let y = x - k;

            // snake
            while (x < n && y < m && a[x] === b[y]) {
                x++;
                y++;
            }

            v[km] = x;

            if (x >= n && y >= m) {
                // reconstruct
                const ops: DiffOp[] = [];
                let curX = n;
                let curY = m;

                for (let dd = d; dd >= 0; dd--) {
                    const vv = trace[dd];
                    if (!vv) break;
                    const kk = curX - curY;
                    const kkm = kk + max;

                    let prevK: number;
                    if (kk === -dd || (kk !== dd && vv[kkm - 1] < vv[kkm + 1])) {
                        prevK = kk + 1; // came from down => insert
                    } else {
                        prevK = kk - 1; // came from right => delete
                    }

                    const prevX = vv[prevK + max];
                    if (prevX === undefined) break;
                    const prevY = prevX - prevK;

                    // snake (equal)
                    while (curX > prevX && curY > prevY) {
                        const val = a[curX - 1];
                        if (val === undefined) break;
                        ops.push({ type: "equal", value: val });
                        curX--;
                        curY--;
                    }

                    if (dd === 0) break;

                    // edit step
                    if (curX === prevX) {
                        // insert
                        const val = b[curY - 1];
                        if (val !== undefined) {
                            ops.push({ type: "insert", value: val });
                        }
                        curY--;
                    } else {
                        // delete
                        const val = a[curX - 1];
                        if (val !== undefined) {
                            ops.push({ type: "delete", value: val });
                        }
                        curX--;
                    }
                }

                ops.reverse();
                return ops;
            }
        }
    }

    // fallback (ne bi trebalo da se desi)
    return [{ type: "equal", value: b.join("") }];
}
