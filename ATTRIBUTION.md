# Attribution & Third-Party Licenses

This project uses the following open-source libraries and datasets. We are
grateful to their authors and communities.

| Dependency | License | Usage |
|------------|---------|-------|
| [FastAPI](https://fastapi.tiangolo.com/) | MIT | Backend REST API framework |
| [Angular](https://angular.dev/) | MIT | Frontend SPA framework |
| [scikit-learn](https://scikit-learn.org/) | BSD-3-Clause | ML classifiers (NB, LR, SVM) and TF-IDF |
| [WeasyPrint](https://weasyprint.org/) | AGPL-3.0 | PDF report generation (used as a dependency, not distributed) |
| [Tailwind CSS](https://tailwindcss.com/) | MIT | Utility-first CSS framework |
| [Uvicorn](https://www.uvicorn.org/) | BSD-3-Clause | ASGI server |
| [Pydantic](https://docs.pydantic.dev/) | MIT | Data validation and settings |
| [xhtml2pdf](https://xhtml2pdf.readthedocs.io/) | Apache-2.0 | Alternative PDF engine |
| [RxJS](https://rxjs.dev/) | Apache-2.0 | Reactive programming in Angular |
| [Docker](https://www.docker.com/) | Apache-2.0 | Containerization |

## Dataset

| Dataset | License / Terms | Notes |
|---------|----------------|-------|
| [IMDb Movie Reviews (50K)](https://ai.stanford.edu/~amaas/data/sentiment/) | Academic / research use | Maas et al. (2011). Used exclusively for academic coursework at UNIR. |

## Note on AGPL-3.0 (WeasyPrint)

WeasyPrint is invoked as a runtime library dependency for server-side PDF
generation. It is **not** distributed as part of this project's source code.
The project itself is licensed under the **MIT License**. If you create a
distribution that bundles WeasyPrint binaries, you must comply with the
AGPL-3.0 terms for that component.
