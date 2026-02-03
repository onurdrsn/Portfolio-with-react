// Timeline data generator function that uses i18n translations
export default function getTimelineData(t) {
    return [
        {
            year: '2024 - 2026',
            company: 'Solvent Yazılım',
            title: t('timeline.items.solvent.title'),
            duration: 'Ağustos 2024 – Ocak 2026',
            details: t('timeline.items.solvent.details', { returnObjects: true })
        },
        {
            year: '2023',
            company: 'Havelsan',
            title: t('timeline.items.havelsan.title'),
            duration: 'Nisan 2023 – Temmuz 2023',
            details: t('timeline.items.havelsan.details', { returnObjects: true })
        },
        {
            year: '2022',
            company: 'Koç Üniversitesi',
            title: t('timeline.items.koc.title'),
            duration: 'Haziran 2022 – Ağustos 2022',
            details: t('timeline.items.koc.details', { returnObjects: true })
        }
    ];
}
