using namespace std;

/* cSpell:disable */

#include <algorithm>
#include <cstring>
#include <fstream>
// #include <iomanip>
#include <iostream>
#include <map>
#include <queue>
#include <set>
#include <sstream>
#include <stack>
#include <string>
#include <vector>

#define INF 0x7fffffff           // 2,147,483,647 for both longs and ints
#define LLINF 0x7fffffffffffffff // 9,223,372,036,854,775,807

typedef long long ll;              // Long Long.
typedef vector<long long> vll;     // Vector of longs
typedef pair<int, int> pii;        // Pair of ints
typedef tuple<int, int, ll> e;     // Weighted edge
typedef vector<vector<long>> gadj; // Adjacency List
typedef vector<e> ge;              // Graph with weighted edges
typedef vector<vector<pii>> vii;

ll dp[400][400];
ll heights[400];
ll prefixSum[400];

int main()
{
    long n, k;
    ifstream cin("snakes.in");
    ofstream fout("snakes.out");
    cin >> n >> k;

    for (int i = 0; i < n; i++)
    {
        cin >> heights[i];
    }

    ll maxHeight = 0;
    memset(dp, -1, sizeof(dp));

    for (int i = 0; i < n; i++)
    {
        if (i == 0)
            prefixSum[0] = heights[0];
        else
            prefixSum[i] = prefixSum[i - 1] + heights[i];
        maxHeight = max(maxHeight, heights[i]);
        dp[i][0] = maxHeight * (i + 1) - prefixSum[i];
    }

    for (int i = 0; i < n; i++)
    {
        maxHeight = 0;
        for (int j = 0; j <= i && j < k; j++)
        {
            dp[i][j + 1] = dp[i][j + 1] == -1 ? dp[i][j] : min(dp[i][j + 1], dp[i][j]);
        }
        for (int d = 1; d < n - i; d++)
        {
            maxHeight = max(maxHeight, heights[i + d]);
            for (int j = 0; j <= i && j < k; j++)
            {
                dp[i + d][j + 1] = (dp[i + d][j + 1] == -1 ? (dp[i][j] + maxHeight * d - prefixSum[i + d] + prefixSum[i]) : (min(dp[i + d][j + 1], dp[i][j] + maxHeight * d - prefixSum[i + d] + prefixSum[i])));
                // cout << i << " " << d << " " << j << " " << dp[i][j] << " | " << i + d << " " << j + 1 << " " << dp[i + d][j + 1] << endl;
            }
        }
    }
    fout << dp[n - 1][k] << endl;
}