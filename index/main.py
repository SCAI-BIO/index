import os
import sys

sys.path.append("../")
import pandas as pd

from index import evaluation
from index.conf import (
    PD_CDM_SRC,
    PPMI_DICT_SRC,
    LUXPARK_DICT_SRC,
    BIOFIND_DICT_SRC,
    AD_CDM_SRC,
)
from index.embedding import GPT4Adapter, MPNetAdapter
from index.evaluation import (
    match_closest_descriptions,
    MatchingMethod,
    enrichment_analysis,
    evaluate,
)
from index.mapping import MappingTable
from index.parsing import MappingSource, DataDictionarySource
from dotenv import load_dotenv

from index.visualisation import (
    scatter_plot_two_distributions,
    enrichment_plot,
    scatter_plot_all_cohorts,
    bar_chart_average_acc_two_distributions,
)

EVAL_PD = True
EVAL_AD = True

load_dotenv()
gpt4 = GPT4Adapter(api_key=os.getenv("GPT_KEY"))  # type: ignore
mpnet = MPNetAdapter()

# PD Mappings

if EVAL_PD:
    cdm_pd_gpt = MappingTable(MappingSource(PD_CDM_SRC, "Feature", "CURIE"))
    cdm_pd_gpt.joined_mapping_table["identifier"].to_csv(
        "resources/cdm_curie.csv", index=False
    )
    cdm_pd_gpt.add_descriptions(
        DataDictionarySource(PD_CDM_SRC, "Feature", "Definition")
    )
    cdm_pd_gpt.compute_embeddings(gpt4)

    cdm_pd_mpnet = MappingTable(MappingSource(PD_CDM_SRC, "Feature", "CURIE"))
    cdm_pd_mpnet.joined_mapping_table["identifier"].to_csv(
        "resources/cdm_curie.csv", index=False
    )
    cdm_pd_mpnet.add_descriptions(
        DataDictionarySource(PD_CDM_SRC, "Feature", "Definition")
    )
    cdm_pd_mpnet.compute_embeddings(mpnet)

    ppmi_gpt = MappingTable(MappingSource(PD_CDM_SRC, "PPMI", "CURIE"))
    ppmi_gpt.add_descriptions(DataDictionarySource(PPMI_DICT_SRC, "ITM_NAME", "DSCR"))
    ppmi_gpt.compute_embeddings(gpt4)

    ppmi_mpnet = MappingTable(MappingSource(PD_CDM_SRC, "PPMI", "CURIE"))
    ppmi_mpnet.add_descriptions(DataDictionarySource(PPMI_DICT_SRC, "ITM_NAME", "DSCR"))
    ppmi_mpnet.compute_embeddings(mpnet)

    luxpark_gpt = MappingTable(MappingSource(PD_CDM_SRC, "LuxPARK", "CURIE"))
    luxpark_gpt.add_descriptions(
        DataDictionarySource(LUXPARK_DICT_SRC, "Variable / Field Name", "Field Label")
    )
    luxpark_gpt.compute_embeddings(gpt4)

    luxpark_mpnet = MappingTable(MappingSource(PD_CDM_SRC, "LuxPARK", "CURIE"))
    luxpark_mpnet.add_descriptions(
        DataDictionarySource(LUXPARK_DICT_SRC, "Variable / Field Name", "Field Label")
    )
    luxpark_mpnet.compute_embeddings(mpnet)

    biofind_gpt = MappingTable(MappingSource(PD_CDM_SRC, "BIOFIND", "CURIE"))
    biofind_gpt.add_descriptions(
        DataDictionarySource(BIOFIND_DICT_SRC, "ITM_NAME", "DSCR")
    )
    biofind_gpt.compute_embeddings(gpt4)

    biofind_mpnet = MappingTable(MappingSource(PD_CDM_SRC, "BIOFIND", "CURIE"))
    biofind_mpnet.add_descriptions(
        DataDictionarySource(BIOFIND_DICT_SRC, "ITM_NAME", "DSCR")
    )
    biofind_mpnet.compute_embeddings(mpnet)

    lrrk2_gpt = MappingTable(MappingSource(PD_CDM_SRC, "LRRK2", "CURIE"))
    lrrk2_gpt.add_descriptions(
        DataDictionarySource(
            "resources/dictionaries/pd/LRRK2.xlsx", "Variable", "Label"
        )
    )
    lrrk2_gpt.compute_embeddings(gpt4)

    lrrk2_mpnet = MappingTable(MappingSource(PD_CDM_SRC, "LRRK2", "CURIE"))
    lrrk2_mpnet.add_descriptions(
        DataDictionarySource(
            "resources/dictionaries/pd/LRRK2.xlsx", "Variable", "Label"
        )
    )
    lrrk2_mpnet.compute_embeddings(mpnet)

    opdc_gpt = MappingTable(MappingSource(PD_CDM_SRC, "OPDC", "CURIE"))
    opdc_gpt.add_descriptions(
        DataDictionarySource(
            "resources/dictionaries/pd/OPDC.csv",
            "Variable Name",
            "Variable description",
        )
    )
    opdc_gpt.compute_embeddings(gpt4)

    opdc_mpnet = MappingTable(MappingSource(PD_CDM_SRC, "OPDC", "CURIE"))
    opdc_mpnet.add_descriptions(
        DataDictionarySource(
            "resources/dictionaries/pd/OPDC.csv",
            "Variable Name",
            "Variable description",
        )
    )
    opdc_mpnet.compute_embeddings(mpnet)

    tpd_gpt = MappingTable(MappingSource(PD_CDM_SRC, "TPD", "CURIE"))
    tpd_gpt.add_descriptions(
        DataDictionarySource(
            "resources/dictionaries/pd/TPD.csv",
            "Variable Name",
            "Variable description",
        )
    )
    tpd_gpt.compute_embeddings(gpt4)

    tpd_mpnet = MappingTable(MappingSource(PD_CDM_SRC, "TPD", "CURIE"))
    tpd_mpnet.add_descriptions(
        DataDictionarySource(
            "resources/dictionaries/pd/TPD.csv",
            "Variable Name",
            "Variable description",
        )
    )
    tpd_mpnet.compute_embeddings(mpnet)

    pd_datasets_gpt = [
        opdc_gpt,
        tpd_gpt,
        biofind_gpt,
        lrrk2_gpt,
        luxpark_gpt,
        ppmi_gpt,
        cdm_pd_gpt,
    ]
    pd_datasets_mpnet = [
        opdc_mpnet,
        tpd_mpnet,
        biofind_mpnet,
        lrrk2_mpnet,
        luxpark_mpnet,
        ppmi_mpnet,
        cdm_pd_mpnet,
    ]
    pd_datasets_labels = [
        "OPDC",
        "PRoBaND",
        "BIOFIND",
        "LCC",
        "LuxPARK",
        "PPMI",
        "PASSIONATE",
    ]

    # enrichment analysis
    luxpark_passionate_enrichment_gpt = enrichment_analysis(
        luxpark_gpt, cdm_pd_gpt, 20, MatchingMethod.EUCLIDEAN_EMBEDDING_DISTANCE
    )
    luxpark_passionate_enrichment_mpnet = enrichment_analysis(
        luxpark_mpnet, cdm_pd_mpnet, 20, MatchingMethod.COSINE_EMBEDDING_DISTANCE
    )
    luxpark_passionate_enrichment_fuzzy = enrichment_analysis(
        luxpark_gpt, cdm_pd_gpt, 20, MatchingMethod.FUZZY_STRING_MATCHING
    )
    label1 = "Enrichment Plot LuxPARK to CDM"
    ppmi_passionate_enrichment_gpt = enrichment_analysis(
        ppmi_gpt, cdm_pd_gpt, 20, MatchingMethod.EUCLIDEAN_EMBEDDING_DISTANCE
    )
    ppmi_passionate_enrichment_mpnet = enrichment_analysis(
        ppmi_mpnet, cdm_pd_mpnet, 20, MatchingMethod.COSINE_EMBEDDING_DISTANCE
    )
    ppmi_passionate_enrichment_fuzzy = enrichment_analysis(
        ppmi_gpt, cdm_pd_gpt, 20, MatchingMethod.FUZZY_STRING_MATCHING
    )
    label2 = "Enrichment Plot PPMI to CDM"
    ppmi_luxpark_enrichment_gpt = enrichment_analysis(
        ppmi_gpt, luxpark_gpt, 20, MatchingMethod.EUCLIDEAN_EMBEDDING_DISTANCE
    )
    ppmi_luxpark_enrichment_mpnet = enrichment_analysis(
        ppmi_mpnet, luxpark_mpnet, 20, MatchingMethod.COSINE_EMBEDDING_DISTANCE
    )
    ppmi_luxpark_enrichment_fuzzy = enrichment_analysis(
        ppmi_gpt, luxpark_gpt, 20, MatchingMethod.FUZZY_STRING_MATCHING
    )
    label3 = "Enrichment Plot PPMI to LuxPARK"
    enrichment_plot(
        luxpark_passionate_enrichment_gpt,
        luxpark_passionate_enrichment_mpnet,
        luxpark_passionate_enrichment_fuzzy,
        label1,
        save_plot=True,
    )
    enrichment_plot(
        ppmi_passionate_enrichment_gpt,
        ppmi_passionate_enrichment_mpnet,
        ppmi_passionate_enrichment_fuzzy,
        label2,
        save_plot=True,
    )
    enrichment_plot(
        ppmi_luxpark_enrichment_gpt,
        ppmi_luxpark_enrichment_mpnet,
        ppmi_luxpark_enrichment_fuzzy,
        label3,
        save_plot=True,
    )
    print(luxpark_passionate_enrichment_gpt)
    print(luxpark_passionate_enrichment_mpnet)
    print(luxpark_passionate_enrichment_fuzzy)
    print(ppmi_passionate_enrichment_gpt)
    print(ppmi_passionate_enrichment_mpnet)
    print(ppmi_passionate_enrichment_fuzzy)
    print(ppmi_luxpark_enrichment_gpt)
    print(ppmi_luxpark_enrichment_mpnet)
    print(ppmi_luxpark_enrichment_fuzzy)

    gpt_table1 = evaluate(
        pd_datasets_gpt,
        pd_datasets_labels,
        store_results=True,
        model="gpt",
        results_root_dir="./resources/results/pd",
    )

    fuzzy_table1 = evaluate(
        pd_datasets_gpt,
        pd_datasets_labels,
        store_results=True,
        model="fuzzy",
        results_root_dir="./resources/results/pd",
    )

    mpnet_table1 = evaluate(
        pd_datasets_mpnet,
        pd_datasets_labels,
        store_results=True,
        model="mpnet",
        results_root_dir="./resources/results/pd",
    )

    print("PD RESULTS:")
    print("GPT")
    print("-----------")
    print(gpt_table1)
    print("-----------")
    print("MPNet")
    print("-----------")
    print(mpnet_table1)
    print("-----------")
    print("Fuzzy")
    print("-----------")
    print(fuzzy_table1)
    print("-----------")

# AD Mappings

if EVAL_AD:
    cdm_ad_gpt = cdm_pd_gpt = MappingTable(
        MappingSource(AD_CDM_SRC, "Feature", "CURIE")
    )
    cdm_ad_gpt.add_descriptions(
        DataDictionarySource(PD_CDM_SRC, "Feature", "Definition")
    )
    cdm_ad_gpt.compute_embeddings(gpt4)

    cdm_ad_mpnet = cdm_pd_gpt = MappingTable(
        MappingSource(AD_CDM_SRC, "Feature", "CURIE")
    )
    cdm_ad_mpnet.add_descriptions(
        DataDictionarySource(PD_CDM_SRC, "Feature", "Definition")
    )
    cdm_ad_mpnet.compute_embeddings(mpnet)

    a4_gpt = MappingTable(MappingSource(AD_CDM_SRC, "A4", "CURIE"))
    a4_gpt.add_descriptions(
        DataDictionarySource("resources/dictionaries/ad/a4.csv", "FLDNAME", "TEXT")
    )
    a4_gpt.compute_embeddings(gpt4)

    a4_mpnet = MappingTable(MappingSource(AD_CDM_SRC, "A4", "CURIE"))
    a4_mpnet.add_descriptions(
        DataDictionarySource("resources/dictionaries/ad/a4.csv", "FLDNAME", "TEXT")
    )
    a4_mpnet.compute_embeddings(mpnet)

    abvib_gpt = MappingTable(MappingSource(AD_CDM_SRC, "ABVIB", "CURIE"))
    abvib_gpt.add_descriptions(
        DataDictionarySource(
            "resources/dictionaries/ad/abvib.csv",
            "variable_name",
            "description",
        )
    )
    abvib_gpt.compute_embeddings(gpt4)

    abvib_mpnet = MappingTable(MappingSource(AD_CDM_SRC, "ABVIB", "CURIE"))
    abvib_mpnet.add_descriptions(
        DataDictionarySource(
            "resources/dictionaries/ad/abvib.csv",
            "variable_name",
            "description",
        )
    )
    abvib_mpnet.compute_embeddings(mpnet)

    adni_gpt = MappingTable(MappingSource(AD_CDM_SRC, "ADNI", "CURIE"))
    adni_gpt.add_descriptions(
        DataDictionarySource(
            "resources/dictionaries/ad/ADNIMERGE_DICT_27Nov2023 2.csv",
            "FLDNAME",
            "TEXT",
        )
    )
    adni_gpt.compute_embeddings(gpt4)

    adni_mpnet = MappingTable(MappingSource(AD_CDM_SRC, "ADNI", "CURIE"))
    adni_mpnet.add_descriptions(
        DataDictionarySource(
            "resources/dictionaries/ad/ADNIMERGE_DICT_27Nov2023 2.csv",
            "FLDNAME",
            "TEXT",
        )
    )
    adni_mpnet.compute_embeddings(mpnet)

    aibl_gpt = MappingTable(MappingSource(AD_CDM_SRC, "AIBL", "CURIE"))
    aibl_gpt.add_descriptions(
        DataDictionarySource(
            "resources/dictionaries/ad/aibl.csv", "Name", "Description"
        )
    )
    aibl_gpt.compute_embeddings(gpt4)

    aibl_mpnet = MappingTable(MappingSource(AD_CDM_SRC, "AIBL", "CURIE"))
    aibl_mpnet.add_descriptions(
        DataDictionarySource(
            "resources/dictionaries/ad/aibl.csv", "Name", "Description"
        )
    )
    aibl_mpnet.compute_embeddings(mpnet)

    arwibo_gpt = MappingTable(MappingSource(AD_CDM_SRC, "ARWIBO", "CURIE"))
    arwibo_gpt.add_descriptions(
        DataDictionarySource(
            "resources/dictionaries/ad/arwibo.csv",
            "Variable_Name",
            "Element_description",
        )
    )
    arwibo_gpt.compute_embeddings(gpt4)

    arwibo_mpnet = MappingTable(MappingSource(AD_CDM_SRC, "ARWIBO", "CURIE"))
    arwibo_mpnet.add_descriptions(
        DataDictionarySource(
            "resources/dictionaries/ad/arwibo.csv",
            "Variable_Name",
            "Element_description",
        )
    )
    arwibo_mpnet.compute_embeddings(mpnet)

    dod_adni_gpt = MappingTable(MappingSource(AD_CDM_SRC, "DOD-ADNI", "CURIE"))
    # TODO most descriptions missing
    dod_adni_gpt.add_descriptions(
        DataDictionarySource(
            "resources/dictionaries/ad/dod-adni.csv", "FLDNAME", "TEXT"
        )
    )
    dod_adni_gpt.compute_embeddings(gpt4)

    dod_adni_mpnet = MappingTable(MappingSource(AD_CDM_SRC, "DOD-ADNI", "CURIE"))
    # TODO most descriptions missing
    dod_adni_mpnet.add_descriptions(
        DataDictionarySource(
            "resources/dictionaries/ad/dod-adni.csv", "FLDNAME", "TEXT"
        )
    )
    dod_adni_mpnet.compute_embeddings(mpnet)

    edsd_gpt = MappingTable(MappingSource(AD_CDM_SRC, "EDSD", "CURIE"))
    edsd_gpt.add_descriptions(
        DataDictionarySource(
            "resources/dictionaries/ad/edsd.xlsx",
            "Variable_Name",
            "Element_description",
        )
    )
    edsd_gpt.compute_embeddings(gpt4)

    edsd_mpnet = MappingTable(MappingSource(AD_CDM_SRC, "EDSD", "CURIE"))
    edsd_mpnet.add_descriptions(
        DataDictionarySource(
            "resources/dictionaries/ad/edsd.xlsx",
            "Variable_Name",
            "Element_description",
        )
    )
    edsd_mpnet.compute_embeddings(mpnet)

    emif_gpt = MappingTable(MappingSource(AD_CDM_SRC, "EMIF", "CURIE"))
    emif_gpt.add_descriptions(
        DataDictionarySource(
            "resources/dictionaries/ad/emif.xlsx", "Variable", "Description"
        )
    )
    emif_gpt.compute_embeddings(gpt4)

    emif_mpnet = MappingTable(MappingSource(AD_CDM_SRC, "EMIF", "CURIE"))
    emif_mpnet.add_descriptions(
        DataDictionarySource(
            "resources/dictionaries/ad/emif.xlsx", "Variable", "Description"
        )
    )
    emif_mpnet.compute_embeddings(mpnet)

    i_adni_gpt = MappingTable(MappingSource(AD_CDM_SRC, "I-ADNI", "CURIE"))
    # TODO about half of descriptions missing
    i_adni_gpt.add_descriptions(
        DataDictionarySource(
            "resources/dictionaries/ad/i-adni.csv", "acronym", "variable"
        )
    )
    i_adni_gpt.compute_embeddings(gpt4)

    i_adni_mpnet = MappingTable(MappingSource(AD_CDM_SRC, "I-ADNI", "CURIE"))
    # TODO about half of descriptions missing
    i_adni_mpnet.add_descriptions(
        DataDictionarySource(
            "resources/dictionaries/ad/i-adni.csv", "acronym", "variable"
        )
    )
    i_adni_mpnet.compute_embeddings(mpnet)

    jadni_gpt = MappingTable(MappingSource(AD_CDM_SRC, "JADNI", "CURIE"))
    jadni_gpt.add_descriptions(
        DataDictionarySource("resources/dictionaries/ad/jadni.tsv", "FLDNAME", "TEXT")
    )
    jadni_gpt.compute_embeddings(gpt4)

    jadni_mpnet = MappingTable(MappingSource(AD_CDM_SRC, "JADNI", "CURIE"))
    jadni_mpnet.add_descriptions(
        DataDictionarySource("resources/dictionaries/ad/jadni.tsv", "FLDNAME", "TEXT")
    )
    jadni_mpnet.compute_embeddings(mpnet)

    pharmacog_gpt = MappingTable(MappingSource(AD_CDM_SRC, "PharmaCog", "CURIE"))
    pharmacog_gpt.add_descriptions(
        DataDictionarySource(
            "resources/dictionaries/ad/pharmacog.csv",
            "Variable_Name",
            "Element_description",
        )
    )
    pharmacog_gpt.compute_embeddings(gpt4)

    pharmacog_mpnet = MappingTable(MappingSource(AD_CDM_SRC, "PharmaCog", "CURIE"))
    pharmacog_mpnet.add_descriptions(
        DataDictionarySource(
            "resources/dictionaries/ad/pharmacog.csv",
            "Variable_Name",
            "Element_description",
        )
    )
    pharmacog_mpnet.compute_embeddings(mpnet)

    prevent_ad_gpt = MappingTable(MappingSource(AD_CDM_SRC, "PREVENT-AD", "CURIE"))
    prevent_ad_gpt.add_descriptions(
        DataDictionarySource(
            "resources/dictionaries/ad/prevent-ad.csv",
            "variable",
            "description",
        )
    )
    prevent_ad_gpt.compute_embeddings(gpt4)

    prevent_ad_mpnet = MappingTable(MappingSource(AD_CDM_SRC, "PREVENT-AD", "CURIE"))
    prevent_ad_mpnet.add_descriptions(
        DataDictionarySource(
            "resources/dictionaries/ad/prevent-ad.csv",
            "variable",
            "description",
        )
    )
    prevent_ad_mpnet.compute_embeddings(mpnet)

    vita_gpt = MappingTable(MappingSource(AD_CDM_SRC, "VITA", "CURIE"))
    vita_gpt.add_descriptions(
        DataDictionarySource(
            "resources/dictionaries/ad/vita.csv",
            "Variable_Name",
            "Element_description",
        )
    )
    vita_gpt.compute_embeddings(gpt4)

    vita_mpnet = MappingTable(MappingSource(AD_CDM_SRC, "VITA", "CURIE"))
    vita_mpnet.add_descriptions(
        DataDictionarySource(
            "resources/dictionaries/ad/vita.csv",
            "Variable_Name",
            "Element_description",
        )
    )
    vita_mpnet.compute_embeddings(mpnet)

    wmh_ad = MappingTable(MappingSource(AD_CDM_SRC, "VITA", "CURIE"))

    ad_datasets_gpt = [
        a4_gpt,
        abvib_gpt,
        adni_gpt,
        aibl_gpt,
        arwibo_gpt,
        dod_adni_gpt,
        edsd_gpt,
        emif_gpt,
        i_adni_gpt,
        jadni_gpt,
        pharmacog_gpt,
        prevent_ad_gpt,
        vita_gpt,
        cdm_ad_gpt,
    ]

    ad_datasets_mpnet = [
        a4_mpnet,
        abvib_mpnet,
        adni_mpnet,
        aibl_mpnet,
        arwibo_mpnet,
        dod_adni_mpnet,
        edsd_mpnet,
        emif_mpnet,
        i_adni_mpnet,
        jadni_mpnet,
        pharmacog_mpnet,
        prevent_ad_mpnet,
        vita_mpnet,
        cdm_ad_mpnet,
    ]
    ad_datasets_labels = [
        "A4",
        "ABVIB",
        "ADNI",
        "AIBL",
        "ARWIBO",
        "DOD-ADNI",
        "EDSD",
        "EMIF",
        "I-ADNI",
        "JADNI",
        "PharmaCog",
        "PREVENT-AD",
        "VITA",
        "AD-Mapper",
    ]
    gpt_table2 = evaluate(
        ad_datasets_gpt,
        ad_datasets_labels,
        store_results=True,
        model="gpt",
        results_root_dir="resources/results/ad",
    )

    fuzzy_table2 = evaluate(
        ad_datasets_gpt,
        ad_datasets_labels,
        store_results=True,
        model="fuzzy",
        results_root_dir="resources/results/ad",
    )

    mpnet_table2 = evaluate(
        ad_datasets_mpnet,
        ad_datasets_labels,
        store_results=True,
        model="mpnet",
        results_root_dir="resources/results/ad",
    )

    print("AD RESULTS:")
    print("GPT")
    print("-----------")
    print(gpt_table2.to_string())
    print("-----------")
    print("MPNet")
    print("-----------")
    print(mpnet_table2.to_string())
    print("-----------")
    print("Fuzzy")
    print("-----------")
    print(fuzzy_table2.to_string())
    print("-----------")

# embedding distribution
scatter_plot_two_distributions(pd_datasets_gpt, ad_datasets_gpt, "PD", "AD")
scatter_plot_all_cohorts(
    pd_datasets_gpt, ad_datasets_gpt, pd_datasets_labels, ad_datasets_labels
)
