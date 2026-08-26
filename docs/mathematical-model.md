# Q-SHIELD Mathematical Model

## Advanced Statistical Engine (Phase 6)

### 1. Error Rate Estimation
$$e = \frac{E}{N}, \quad E \le N, \, N > 0$$
$$\bar{e}_{agg} = \frac{\sum_{i} E_i}{\sum_{i} N_i}$$

### 2. False Acceptance & Rejection Rates
$$\text{FAR} = \frac{N_{\text{false\_accept}}}{N_{\text{attempts}}}, \quad \text{FRR} = \frac{N_{\text{false\_reject}}}{N_{\text{legitimate}}}$$

### 3. Wilson Score Confidence Interval
$$p \pm \frac{z}{1 + \frac{z^2}{n}} \sqrt{\frac{p(1-p)}{n} + \frac{z^2}{4n^2}}$$

### 4. Binomial Hypothesis Testing
$$H_0: p = p_0 \quad \text{vs} \quad H_1: p \neq p_0$$
$$P(K = k) = \binom{n}{k} p^k (1-p)^{n-k}$$
