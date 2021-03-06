﻿using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Stratis.Bitcoin;
using Stratis.Bitcoin.Builder;
using Stratis.Bitcoin.Builder.Feature;
using Stratis.Bitcoin.Logging;

namespace Breeze.Api
{
	/// <summary>
	/// Provides an Api to the full node
	/// </summary>
	public class ApiFeature : FullNodeFeature
	{		
		private readonly IFullNodeBuilder fullNodeBuilder;
		private readonly FullNode fullNode;

		public ApiFeature(IFullNodeBuilder fullNodeBuilder, FullNode fullNode)
		{
			this.fullNodeBuilder = fullNodeBuilder;
			this.fullNode = fullNode;
		}

		public override void Start()
		{
		    Logs.FullNode.LogInformation($"Api starting on url {this.fullNode.Settings.ApiUri}");
            Program.Initialize(this.fullNodeBuilder.Services, this.fullNode);
		}
	}

	public static class ApiFeatureExtension
	{
		public static IFullNodeBuilder UseApi(this IFullNodeBuilder fullNodeBuilder)
		{
			fullNodeBuilder.ConfigureFeature(features =>
			{
				features
				.AddFeature<ApiFeature>()
				.FeatureServices(services =>
					{
						services.AddSingleton(fullNodeBuilder);
					});
			});

			return fullNodeBuilder;
		}
	}	
}
