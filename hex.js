class Hex {

    neighbors = [null, null, null, null, null, null];
    walls = [true, true, true, true, true, true];
    visited = false;
    r = 0;
    c = 0;

    setN(index, n) {
        this.neighbors[index] = n;
    }

    setCoords(rI, cI) {
        this.r = rI;
        this.c = cI;
    }

    getN(index) {
        return this.neighbors[index];
    }

    getAvailN() {
        let avail = [];
        for (let i = 0; i < 6; i++) {
            if (this.neighbors[i] != null && !this.neighbors[i].visited && this.walls[i]) {
                avail.push(this.neighbors[i]);
            }
        }
        return avail;
    }

    rmWall(i) {
        this.walls[i] = false;
    }

    findRmWall(h) {
        for (let i = 0; i < 6; i++) {
            if (this.neighbors[i] == h) {
                this.walls[i] = false;
            }
        }
    }

    getNoWall() {
        let res = [];
        for (let i = 0; i < 6; i++) {
            if (!this.walls[i]) {
                res.push(i);
            }
        }
        return res;
    }
}