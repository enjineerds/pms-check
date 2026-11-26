| Engine | Photos | Errors | Prices found | Lines read | Total found | Median time |
|---|---|---|---|---|---|---|
| vision | 39 | 0 | 92% | 81% | 89% | 773 ms |
| vision-corrected | 39 | 0 | 92% | 84% | 91% | 872 ms |
| mlkit | 39 | 0 | 80% | 75% | 80% | 94 ms |

**printed**

| Engine | Photos | Errors | Prices found | Lines read | Total found | Median time |
|---|---|---|---|---|---|---|
| vision | 26 | 0 | 96% | 91% | 83% | 775 ms |
| vision-corrected | 26 | 0 | 96% | 93% | 88% | 875 ms |
| mlkit | 26 | 0 | 92% | 86% | 88% | 111 ms |

**screen**

| Engine | Photos | Errors | Prices found | Lines read | Total found | Median time |
|---|---|---|---|---|---|---|
| vision | 7 | 0 | 100% | 100% | 100% | 809 ms |
| vision-corrected | 7 | 0 | 100% | 100% | 100% | 919 ms |
| mlkit | 7 | 0 | 99% | 96% | 100% | 92 ms |

**handwritten**

| Engine | Photos | Errors | Prices found | Lines read | Total found | Median time |
|---|---|---|---|---|---|---|
| vision | 6 | 0 | 68% | 17% | 100% | 773 ms |
| vision-corrected | 6 | 0 | 68% | 25% | 100% | 872 ms |
| mlkit | 6 | 0 | 4% | 0% | 20% | 91 ms |

**Does confidence separate right prices from wrong ones?** (price-only OCR lines)

| Engine | High-confidence lines that are a real price | Low-confidence lines that are a real price |
|---|---|---|
| vision | 55% of 988 | 33% of 221 |
| vision-corrected | 57% of 1075 | 2% of 133 |
| mlkit | - | - |

<details><summary>Per photo</summary>

| Photo | vision prices / lines | vision-corrected prices / lines | mlkit prices / lines |
|---|---|---|---|
| reddit-01-10k-check-up-table | 100% / 100% | 100% / 100% | 91% / 92% |
| reddit-01-caltex-handwritten-job-order | 43% / 13% | 43% / 25% | 0% / 0% |
| reddit-01-chery-pms-estimate | 100% / 100% | 100% / 100% | 100% / 100% |
| reddit-01-ford-ecosport-handwritten | 57% / 29% | 57% / 43% | 14% / 0% |
| reddit-01-handwritten-job-order-highlighted | 56% / 5% | 56% / 5% | 0% / 0% |
| reddit-01-handwritten-job-order-long | 85% / 33% | 85% / 44% | 0% / 0% |
| reddit-01-honda-10k-handwritten | 88% / 0% | 88% / 13% | 13% / 0% |
| reddit-01-honda-1yr-estimate | 85% / 79% | 85% / 79% | 100% / 100% |
| reddit-01-honda-1yr-spreadsheet | 100% / 100% | 100% / 100% | 100% / 90% |
| reddit-01-honda-2yr-estimate | 91% / 88% | 91% / 88% | 87% / 88% |
| reddit-01-honda-4.5yr-printout | 100% / 100% | 100% / 100% | 100% / 88% |
| reddit-01-honda-40k-2yr-estimate | 93% / 40% | 93% / 47% | 71% / 67% |
| reddit-01-honda-6mo-annotated-photo | 94% / 100% | 94% / 100% | 100% / 88% |
| reddit-01-honda-6mo-estimate-photo | 100% / 91% | 100% / 91% | 100% / 91% |
| reddit-01-honda-6mo-printout-photo | 100% / 100% | 100% / 94% | 94% / 76% |
| reddit-01-honda-brv-1.5yr-sap-screen | 100% / 100% | 100% / 100% | 100% / 100% |
| reddit-01-honda-city-60k-estimate | 100% / 100% | 100% / 100% | 100% / 100% |
| reddit-01-kia-sorento-pms-guide | 100% / 100% | 100% / 100% | 100% / 91% |
| reddit-01-mitsubishi-handwritten-estimate | 78% / 22% | 78% / 22% | 0% / 0% |
| reddit-01-mitsubishi-mirage-30k-estimate-photo | 91% / 100% | 91% / 100% | 82% / 67% |
| reddit-01-mitsubishi-montero-pms-photo | 100% / 86% | 100% / 86% | 83% / 100% |
| reddit-01-mitsubishi-xpander-15k-photo | 100% / 100% | 100% / 100% | 100% / 91% |
| reddit-01-mitsubishi-xpander-15k-repair-estimate | 100% / 100% | 100% / 100% | 100% / 100% |
| reddit-01-mitsubishi-xpander-service-menu-photo | 100% / 100% | 100% / 100% | 100% / 100% |
| reddit-01-nissan-navara-70k-repair-order-photo | 86% / 100% | 86% / 100% | 100% / 100% |
| reddit-01-regular-check-up-estimate-photo | 100% / 100% | 100% / 100% | 100% / 100% |
| reddit-01-toyota-10k-job-order | 100% / 100% | 100% / 100% | 100% / 60% |
| reddit-01-toyota-1k-job-order | 100% / 100% | 100% / 100% | 100% / 100% |
| reddit-01-toyota-1k-repair-order-photo | 75% / 100% | 75% / 100% | 63% / 100% |
| reddit-01-toyota-20k-job-order-b | 100% / 100% | 100% / 100% | 100% / 100% |
| reddit-01-toyota-20k-job-order | 100% / 100% | 100% / 100% | 100% / 100% |
| reddit-01-toyota-20k-repair-order-photo | 100% / 100% | 100% / 100% | 100% / 84% |
| reddit-01-toyota-35k-job-order | 100% / 92% | 100% / 92% | 92% / 92% |
| reddit-01-toyota-avanza-35k-job-estimate | 100% / 100% | 100% / 100% | 100% / 100% |
| reddit-01-unknown-estimate-printed | 100% / 100% | 100% / 100% | 100% / 100% |
| reddit-01-widevalue-independent-quote | 100% / 100% | 100% / 100% | 90% / 100% |
| screenshot-2026-11-26-045821 | 100% / 27% | 100% / 64% | 100% / 27% |
| screenshot-2026-11-26-045855 | 82% / 64% | 82% / 82% | 73% / 55% |
| screenshot-2026-11-26-045935 | 100% / 100% | 100% / 100% | 57% / 75% |

</details>
