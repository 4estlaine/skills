import numpy as np
import matplotlib.pyplot as plt

E = []
V = []
S = []
stats = []
N = 10
for n in range(N):
    E.append(n*(1.0+0.75*(n+1)))
    V.append(5.0/24 * n*(n+1)*(2*n+1))
    S.append(np.sqrt(V[n]))
    stats.append((n, E[n], V[n], S[n]))
n = np.arange(N)
print(stats[1:N])
# plt.plot(n, E, 'r', n, V, 'b')
# plt.show()
