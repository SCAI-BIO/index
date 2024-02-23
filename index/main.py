import os
import sys

sys.path.append("../")
import pandas as pd

from index import evaluation
from index.conf import PD_CDM_SRC, PPMI_DICT_SRC, LUXPARK_DICT_SRC, BIOFIND_DICT_SRC, AD_CDM_SRC
from index.embedding import EmbeddingModel, GPT4Adapter, SentenceTransformerAdapter
from index.evaluation import match_closest_descriptions, MatchingMethod, enrichment_analysis, evaluate
from index.mapping import MappingTable
from index.parsing import MappingSource, DataDictionarySource
from dotenv import load_dotenv

from index.visualisation import scatter_plot_two_distributions, enrichment_plot, scatter_plot_all_cohorts, \
    bar_chart_average_acc_two_distributions


def create_datasets(model: EmbeddingModel, EVAL_PD = True, EVAL_AD = True):
    results_pd = {}
    results_ad = {}
    if EVAL_PD:
        opdc = MappingTable(MappingSource(PD_CDM_SRC, "OPDC", "CURIE"))
        opdc.add_descriptions(DataDictionarySource("resources/dictionaries/pd/OPDC.csv", "Variable Name", "Variable description"))
        opdc.compute_embeddings(model)
        results_pd["OPDC"] = opdc

        proband = MappingTable(MappingSource(PD_CDM_SRC, "TPD", "CURIE"))
        proband.add_descriptions(DataDictionarySource("resources/dictionaries/pd/TPD.csv", "Variable Name", "Variable description"))
        proband.compute_embeddings(model)
        results_pd["PRoBaND"] = proband

        biofind = MappingTable(MappingSource(PD_CDM_SRC, "BIOFIND", "CURIE"))
        biofind.add_descriptions(DataDictionarySource(BIOFIND_DICT_SRC, "ITM_NAME", "DSCR"))
        biofind.compute_embeddings(model)
        results_pd["BIOFIND"] = biofind

        lcc = MappingTable(MappingSource(PD_CDM_SRC, "LRRK2", "CURIE"))
        lcc.add_descriptions(DataDictionarySource("resources/dictionaries/pd/LRRK2.xlsx", "Variable", "Label"))
        lcc.compute_embeddings(model)
        results_pd["LCC"] = lcc

        luxpark = MappingTable(MappingSource(PD_CDM_SRC, "LuxPARK", "CURIE"))
        luxpark.add_descriptions(DataDictionarySource(LUXPARK_DICT_SRC, "Variable / Field Name", "Field Label"))
        luxpark.compute_embeddings(model)
        results_pd["LuxPARK"] = luxpark

        ppmi = MappingTable(MappingSource(PD_CDM_SRC, "PPMI", "CURIE"))
        ppmi.add_descriptions(DataDictionarySource(PPMI_DICT_SRC, "ITM_NAME", "DSCR"))
        ppmi.compute_embeddings(model)
        results_pd["PPMI"] = ppmi

        cdm_pd = MappingTable(MappingSource(PD_CDM_SRC, "Feature", "CURIE"))
        cdm_pd.joined_mapping_table["identifier"].to_csv("resources/cdm_curie.csv", index=False)
        cdm_pd.add_descriptions(DataDictionarySource(PD_CDM_SRC, "Feature", "Definition"))
        cdm_pd.compute_embeddings(model)
        results_pd["PASSIONATE"] = cdm_pd

    if EVAL_AD:
        cdm_ad = cdm_pd = MappingTable(MappingSource(AD_CDM_SRC, "Feature", "CURIE"))
        cdm_ad.add_descriptions(DataDictionarySource(PD_CDM_SRC, "Feature", "Definition"))
        cdm_ad.compute_embeddings(model)
        results_ad["AD-Mapper"] = cdm_ad

        a4 = MappingTable(MappingSource(AD_CDM_SRC, "A4", "CURIE"))
        a4.add_descriptions(DataDictionarySource("resources/dictionaries/ad/a4.csv", "FLDNAME", "TEXT"))
        a4.compute_embeddings(model)
        results_ad["A4"] = a4

        abvib = MappingTable(MappingSource(AD_CDM_SRC, "ABVIB", "CURIE"))
        abvib.add_descriptions(DataDictionarySource("resources/dictionaries/ad/abvib.csv", "variable_name", "description"))
        abvib.compute_embeddings(model)
        results_ad["ABVIB"] = abvib

        adni = MappingTable(MappingSource(AD_CDM_SRC, "ADNI", "CURIE"))
        adni.add_descriptions(DataDictionarySource("resources/dictionaries/ad/ADNIMERGE_DICT_27Nov2023 2.csv", "FLDNAME", "TEXT"))
        adni.compute_embeddings(model)
        results_ad["ADNI"] = adni

        aibl = MappingTable(MappingSource(AD_CDM_SRC, "AIBL", "CURIE"))
        aibl.add_descriptions(DataDictionarySource("resources/dictionaries/ad/aibl.csv", "Name", "Description"))
        aibl.compute_embeddings(model)
        results_ad["AIBL"] = aibl

        arwibo = MappingTable(MappingSource(AD_CDM_SRC, "ARWIBO", "CURIE"))
        arwibo.add_descriptions(DataDictionarySource("resources/dictionaries/ad/arwibo.csv", "Variable_Name", "Element_description"))
        arwibo.compute_embeddings(model)
        results_ad["ARWIBO"] = arwibo

        dod_adni = MappingTable(MappingSource(AD_CDM_SRC, "DOD-ADNI", "CURIE"))
        dod_adni.add_descriptions(DataDictionarySource("resources/dictionaries/ad/dod-adni.csv", "FLDNAME", "TEXT"))
        dod_adni.compute_embeddings(model)
        results_ad["DOD-ADNI"] = dod_adni

        edsd = MappingTable(MappingSource(AD_CDM_SRC, "EDSD", "CURIE"))
        edsd.add_descriptions(DataDictionarySource("resources/dictionaries/ad/edsd.xlsx", "Variable_Name", "Element_description"))
        edsd.compute_embeddings(model)
        results_ad["EDSD"] = edsd

        emif = MappingTable(MappingSource(AD_CDM_SRC, "EMIF", "CURIE"))
        emif.add_descriptions(DataDictionarySource("resources/dictionaries/ad/emif.xlsx", "Variable", "Description"))
        emif.compute_embeddings(model)
        results_ad["EMIF"] = emif

        i_adni = MappingTable(MappingSource(AD_CDM_SRC, "I-ADNI", "CURIE"))
        i_adni.add_descriptions(DataDictionarySource("resources/dictionaries/ad/i-adni.csv", "acronym", "variable"))
        i_adni.compute_embeddings(model)
        results_ad["I-ADNI"] = i_adni

        jadni = MappingTable(MappingSource(AD_CDM_SRC, "JADNI", "CURIE"))
        jadni.add_descriptions(DataDictionarySource("resources/dictionaries/ad/jadni.tsv", "FLDNAME", "TEXT"))
        jadni.compute_embeddings(model)
        results_ad["JADNI"] = jadni

        pharmacog = MappingTable(MappingSource(AD_CDM_SRC, "PharmaCog", "CURIE"))
        pharmacog.add_descriptions(DataDictionarySource("resources/dictionaries/ad/pharmacog.csv", "Variable_Name", "Element_description"))
        pharmacog.compute_embeddings(model)
        results_ad["PharmaCog"] = pharmacog

        prevent_ad = MappingTable(MappingSource(AD_CDM_SRC, "PREVENT-AD", "CURIE"))
        prevent_ad.add_descriptions(DataDictionarySource("resources/dictionaries/ad/prevent-ad.csv", "variable", "description"))
        prevent_ad.compute_embeddings(model)
        results_ad["PREVENT-AD"] = prevent_ad

        vita = MappingTable(MappingSource(AD_CDM_SRC, "VITA", "CURIE"))
        vita.add_descriptions(DataDictionarySource("resources/dictionaries/ad/vita.csv", "Variable_Name", "Element_description"))
        vita.compute_embeddings(model)
        results_ad["VITA"] = vita

    return results_pd, results_ad


load_dotenv()
gpt4 = GPT4Adapter(api_key=os.getenv("GPT_KEY"))  # type: ignore
mpnet = SentenceTransformerAdapter(model="sentence-transformers/all-mpnet-base-v2")
pd_gpt, ad_gpt = create_datasets(gpt4)
pd_mpnet, ad_mpnet = create_datasets(mpnet)

# PD Mapping Analyses
# enrichment analysis
luxpark_passionate_enrichment_gpt = enrichment_analysis(pd_gpt["LuxPARK"], pd_gpt["PASSIONATE"], 20)
luxpark_passionate_enrichment_mpnet = enrichment_analysis(pd_mpnet["LuxPARK"], pd_mpnet["PASSIONATE"], 20, MatchingMethod.COSINE_EMBEDDING_DISTANCE)
luxpark_passionate_enrichment_fuzzy = enrichment_analysis(pd_gpt["LuxPARK"], pd_gpt["PASSIONATE"], 20, MatchingMethod.FUZZY_STRING_MATCHING)
label1 = "Enrichment Plot LuxPARK to CDM"
ppmi_passionate_enrichment_gpt = enrichment_analysis(pd_gpt["PPMI"], pd_gpt["PASSIONATE"], 20)
ppmi_passionate_enrichment_mpnet = enrichment_analysis(pd_mpnet["PPMI"], pd_mpnet["PASSIONATE"], 20, MatchingMethod.COSINE_EMBEDDING_DISTANCE)
ppmi_passionate_enrichment_fuzzy = enrichment_analysis(pd_gpt["PPMI"], pd_gpt["PASSIONATE"], 20, MatchingMethod.FUZZY_STRING_MATCHING)
label2 = "Enrichment Plot PPMI to CDM"
ppmi_luxpark_enrichment_gpt = enrichment_analysis(pd_gpt["PPMI"], pd_gpt["LuxPARK"], 20)
ppmi_luxpark_enrichment_mpnet = enrichment_analysis(pd_mpnet["PPMI"], pd_mpnet["LuxPARK"], 20, MatchingMethod.COSINE_EMBEDDING_DISTANCE)
ppmi_luxpark_enrichment_fuzzy = enrichment_analysis(pd_gpt["PPMI"], pd_gpt["LuxPARK"], 20, MatchingMethod.FUZZY_STRING_MATCHING)
label3 = "Enrichment Plot PPMI to LuxPARK"

luxpark_passionate_accuracies = {"GPT": luxpark_passionate_enrichment_gpt,
                                 "MPNet": luxpark_passionate_enrichment_mpnet,
                                 "Fuzzy": luxpark_passionate_enrichment_fuzzy}

ppmi_passionate_accuracies = {"GPT": ppmi_passionate_enrichment_gpt,
                              "MPNet": ppmi_passionate_enrichment_mpnet,
                              "Fuzzy": ppmi_passionate_enrichment_fuzzy}

ppmi_luxpark_accuracies = {"GPT": ppmi_luxpark_enrichment_gpt,
                           "MPNet": ppmi_luxpark_enrichment_mpnet,
                           "Fuzzy": ppmi_luxpark_enrichment_fuzzy}

enrichment_plot(luxpark_passionate_accuracies, label1, save_plot=False)
enrichment_plot(ppmi_passionate_accuracies, label2, save_plot=False)
enrichment_plot( ppmi_luxpark_accuracies, label3, save_plot=False)

gpt_table1 = evaluate(list(pd_gpt.values()), list(pd_gpt.keys()), model="gpt", store_results=False)
fuzzy_table1 = evaluate(list(pd_gpt.values()), list(pd_mpnet.keys()), model="fuzzy", matching_method="fuzzy", store_results=False)
mpnet_table1 = evaluate(list(pd_mpnet.values()), list(pd_gpt.keys()), model="mpnet", matching_method="cosine", store_results=False)

print("\n PD RESULTS: \n")
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

# AD Mapping Analyses
gpt_table2 = evaluate(list(ad_gpt.values()), list(ad_gpt.keys()), model="gpt", store_results=False, results_root_dir="resources/results/ad")
fuzzy_table2 = evaluate(list(ad_gpt.values()), list(ad_gpt.keys()), model="fuzzy", matching_method="fuzzy",
                        store_results=False,  results_root_dir="resources/results/ad")
mpnet_table2 = evaluate(list(ad_mpnet.values()), list(ad_mpnet.keys()), model="mpnet", matching_method="cosine",
                        store_results=False,  results_root_dir="resources/results/ad")

print("\n AD RESULTS: \n")
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
scatter_plot_two_distributions(list(pd_gpt.values()), list(ad_gpt.values()), "PD", "AD")
scatter_plot_all_cohorts(list(pd_gpt.values()), list(ad_gpt.values()), list(pd_gpt.keys()), list(ad_gpt.keys()))
